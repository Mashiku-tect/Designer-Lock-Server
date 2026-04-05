const { or } = require('sequelize');
const {Product,User,Images}  = require('../models');
const slugify = require('slugify'); // install this package with `npm install slugify`
const axios = require("axios");


// Helper to generate a unique productId
async function generateUniqueProductId(clientName, designTitle) {
  const baseId = `${clientName.trim().toLowerCase().replace(/\s+/g, '_')}_${designTitle.trim().toLowerCase().replace(/\s+/g, '_')}`;
  let product_id = baseId;
  let suffix = 1;

  while (await Product.findOne({ where: { product_id } })) {
    product_id = `${baseId}${suffix}`;
    suffix++;
  }

  return product_id;
}

//Validate Price
function isValidPrice(input) {
  // Must be a string or number
  if (typeof input !== 'string' && typeof input !== 'number') return false;

  // Convert to string and trim
  const str = String(input).trim();

  // Strict regex: only digits and optional decimal (no letters, no "-")
  const validFormat = /^\d+(\.\d{1,2})?$/;

  // Check format
  if (!validFormat.test(str)) return false;

  // Convert to number
  const num = Number(str);

  // Final check: number must be finite and non-negative
  return Number.isFinite(num) && num >= 0;
}


//end of function
// Controller function to create a new order



exports.createOrder = async (req, res) => {
  const {
    designtitle,
    clientname,
    clientphonenumber,
    price,
    isPublic,
    caption,
    orderType
  } = req.body;
  //console.log("Body",req.body);
  //let price2=price;

  try {

      //verify order type
  if(orderType!=='designFeed' && orderType!=='business'){
    return res.status(400).json({success:false,message:"Invalid Order Type"});
  }

    if(orderType!=='designFeed'){
   

  if (!clientname||!designtitle||!clientphonenumber||!price) {
      return res.status(400).json({success:false, message: 'Missing Required Fields' });
      //console.log('Missing fields');
    }
    
    if (!isValidPrice(price)) {
      //console.log("Price is Invalid")
    return res.status(400).json({ success:false,message: 'Invalid price format' });
  }
  
    }

    if(orderType==='designFeed'){
      if(!designtitle){
        return res.status(400).json({success:false,message:"Design Title is Required for Design Feed Orders"});
      }
    }

       //For Design Feed Orders, client details are fetched from user profile
       const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ success:false,message: 'User not found' });
  }
    

    
    



 
  

 // console.log("Reached Here")

const numericPrice = Number(price);

    const product_id = await generateUniqueProductId(clientname ? clientname:user.firstname, designtitle);

    // 1️⃣ Create product
    const newProduct = await Product.create({
      productname: designtitle,
      clientname:orderType==='designFeed' ? user.firstname : clientname,
      clientphonenumber: orderType==='designFeed' ? user.phonenumber : clientphonenumber,
      price:orderType==='designFeed' ? 0 : price,
      user_id: req.user.id,
      product_id,
      designtitle,
      isPublic,
      Caption: isPublic ? caption : null,
      orderType,
      status: orderType==='designFeed' ? 'Completed' : 'In Progress',
    });

    // 2️⃣ Save uploaded files (images/videos)
    if (req.files && req.files.length > 0) {
      const fileEntries = req.files.map(file => {
        const fileType = file.mimetype.startsWith('video') ? 'video' : 'image';
        return {
          productId: product_id,
          path: file.path.replace(/\\/g, '/'),
          fileType, // ✅ new field to distinguish media type
        };
      });

      await Images.bulkCreate(fileEntries);
    }

    // 3️⃣ Increment user's post count
    await User.increment('posts', { where: { user_id: req.user.id } });

    const designer = await User.findByPk(req.user.id);
    const formattedphonenumber="+"+clientphonenumber;

    //possibly find the client in the databse using the client bphone number provided,if exists send a push notification to him
const client=await User.findOne({where:{phonenumber:formattedphonenumber}});
if(client){
  const expoToken=client.expoPushToken;
   if (expoToken) {
      const pushMessage = {
        to: expoToken,
        sound: "default",
        title: "New Order For You",
        body: `${designer.firstname} ${designer.lastname} has created a new order for you with ID  ${newProduct.product_id} having title ${designtitle}`,
        data: {
         
          screen: "Dashboard",
        },
      };
  
      try {
        await axios.post("https://exp.host/--/api/v2/push/send", pushMessage, {
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error(
          "Push Notification Error (expired request):",
          err.response?.data || err.message
        );
      }
    }
}

    return res.status(201).json({success:true,
      message: `Product created successfully with ID: ${product_id}`,
      productId: product_id,
    });

  } catch (error) {
    
    console.error('Create product error:', error);
    return res.status(500).json({success:false, message: 'Server error' });
  }
};


// DELETE /api/orders/:productId
exports.deleteOrder = async (req, res) => {
  const user_id = req.user.id;
  const { productId } = req.params;

  

  try {
    const order = await Product.findOne({ where: { product_id: productId, user_id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
   
     //if current order status is Completed,Perform a soft delete else a hard delete
     if(order.status === 'Completed'){
//Perform Soft Delete by setting is_visible to false
    await Product.update(
      { softdeleted: true },
      { where: { product_id: productId, user_id } }
    );
     }
     else{
//Perform Hard Delete
    await Product.destroy({ where: { product_id: productId, user_id } });
  //also delete all images associated with that product
  await Images.destroy({ where: { productId } });
     }
    

    // Decrease user's post count by 1 only if the order was in progress
     if (order.status === 'In Progress') {
    await User.decrement('posts', {
      where: { user_id }
    });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
//end of delete order function


//edit order function beggins
exports.EditOrder = async (req, res) => {
  //console.log("Received A request body",req.body);
  try {
    const { orderid } = req.params;
    const { clientname, clientphonenumber, designtitle, price,isPublic } = req.body;
    const product_id = orderid;

    //Validate The User Inputs 
    if(!clientname||!clientphonenumber||!designtitle||!price){
      return res.status(400).json({success:false,message:"Provide All Required Fileds"});
    }
    //validate Price
    
    if (!isValidPrice(price)) {
      //console.log("Price is Invalid")
    return res.status(400).json({ success:false,message: 'Invalid price format' });
  }


    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success:false,message: "Order Not Found" });
    }

    await Product.update(
      {
        clientname,
        clientphonenumber,
        designtitle,
        productname: designtitle,
        price,
        isPublic
      },
      { where: { product_id: product_id } }
    );

    // Remove old files
    await Images.destroy({
      where: { productId: product_id },
    });

    // Upload new files
    if (req.files && req.files.length > 0) {
      const imageEntries = req.files.map((file) => {
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');

        let fileType = 'image';
        if (isVideo) fileType = 'video';
        else if (!isImage) fileType = 'unknown';

        return {
          productId: product_id,
          path: file.path.replace(/\\/g, '/'),
          fileType, // ✅ save whether it's image or video
        };
      });

      await Images.bulkCreate(imageEntries);
    } else {
      return res.status(400).json({success:false, message: "Provide Files To Upload" });
    }

    return res.status(200).json({success:true, message: "Order Updated Successfully" });
  } catch (error) {
    //console.error("EditOrder Error:", error);
    return res.status(500).json({success:false, message: "Server Error" });
  }
};
