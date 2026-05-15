const Global = require('../models/globalModel');
const PDFDocument = require('pdfkit');
const Order = require('../models/orderModel');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');


const globalController = {
 getstatus: async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }
    let statuses = await Global.findOne();
    if (!statuses) {
      statuses = new Global({ showPrice: true });
      await statuses.save();
    }
    res.status(200).json({ showPrice: statuses.showPrice });
  } catch (err) {
    console.error("Get Status Error:", err);
    res.status(500).json({ error: "Failed to fetch global status" });
  }
}
  ,
setdelivery: async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }
    const { westbank, jerusalem, occupiedinterior } = req.body;

    let globalDoc = await Global.findOne();

    if (!globalDoc) {
      globalDoc = new Global({ delivery: { westbank, jerusalem, occupiedinterior } });
    } else {
      globalDoc.delivery.westbank = westbank;
      globalDoc.delivery.jerusalem = jerusalem;
      globalDoc.delivery.occupiedinterior = occupiedinterior;
    }

    await globalDoc.save();

    res.status(200).json(globalDoc);
  } catch (err) {
    console.error("Set Status Error:", err);
    res.status(500).json({ error: "Failed to update global status" });
  }
},getdelivery: async (req, res) => {
  try {
    let statuses = await Global.findOne();
    if (!statuses) {
      statuses = new Global({ delivery: { westbank: 0, jerusalem: 0, occupiedinterior: 0 } });
      await statuses.save();
    }
    res.status(200).json({
      westbank: statuses.delivery.westbank,
      jerusalem: statuses.delivery.jerusalem,
      occupiedinterior: statuses.delivery.occupiedinterior
    });
  } catch (err) {
    console.error("Get Status Error:", err);
    res.status(500).json({ error: "Failed to fetch global status" });
  }
}
  ,
  setstatus: async (req, res) => {
    try {
      const { status } = req.body;

      let globalDoc = await Global.findOne();

      if (!globalDoc) {
        globalDoc = new Global({ showPrice: status });
      } else {
        globalDoc.showPrice = status;
      }

      await globalDoc.save();

      res.status(200).json(globalDoc);
    } catch (err) {
      console.error("Set Status Error:", err);
      res.status(500).json({ error: "Failed to update global status" });
    }
  },
  getmakeorder: async (req, res) => {
  try {
    let statuses = await Global.findOne();
    
    if (!statuses) {
      statuses = new Global({ allowmakeorder: true, showPrice: true });
      await statuses.save();
    }
    
    res.status(200).json({ allowmakeorder: statuses.allowmakeorder });
  } catch (err) {
    console.error("Get Status Error:", err);
    res.status(500).json({ error: "Failed to fetch global status" });
  }
}getmakeorder: async (req, res) => {
  try {
    let statuses = await Global.findOne();
    
    if (!statuses) {
      statuses = new Global({ allowmakeorder: true, showPrice: true });
      await statuses.save();
    }
    
    res.status(200).json({ allowmakeorder: statuses.allowmakeorder });
  } catch (err) {
    console.error("Get Status Error:", err);
    res.status(500).json({ error: "Failed to fetch global status" });
  }
},
  setmakeorder: async (req, res) => {
    try {
      const { status } = req.body;
      let globalDoc = await Global.findOne();
      if (!globalDoc) {
        globalDoc = new Global({ allowmakeorder: status });
      } else {
        globalDoc.allowmakeorder = status;
      }

      await globalDoc.save();

      res.status(200).json(globalDoc);
    } catch (err) {
      console.error("Set Status Error:", err);
      res.status(500).json({ error: "Failed to update global status" });
    }
  },
  // In the backend controller
  printPDF: async (req, res) => {
    const { orderId } = req.query;
  
    const order = await Order.findOne({ id2: orderId });
    if (!order) return res.status(404).send('Order not found');
  
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
    doc.pipe(res);
    const logoPath = path.join(__dirname, '..', 'images', 'logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 50 });
    }
    // Header - Logo + Company Info
    doc
      .fontSize(20).font('Helvetica-Bold').text('Tech-Shop', 110, 57)
      .fontSize(10).font('Helvetica')
      .text('Tulkarm, West Bank', 110, 75)
      .text('Phone: (970) 595-642-327', 110, 90)
      .text('Email: support@Tech-Shop.com', 110, 105)
      .moveDown();
  
    // Invoice title and meta
    doc
      .fillColor('#000')
      .fontSize(24).font('Helvetica-Bold').text('Bill', 50, 130,{ align: 'center' })
      .fontSize(12).font('Helvetica')
      .text(`Invoice #: ${orderId}`, 400, 160)
      .text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 400, 175)
      .text(`Due Date: ${new Date(order.date).toLocaleDateString('en-GB')}`, 400, 190)
      .text(`Customer: ${order.userName}`, 400, 205)
      .text(`Phone: ${order.phone}`, 400, 220);
  
    // Line separator
    doc.moveTo(50, 240).lineTo(550, 240).stroke();
  
    // Items Table Header
    doc
      .fontSize(12).font('Helvetica-Bold')
      .text('Item Name', 50, 250)
      .text('Qty', 100, 250, { align: 'center' })
      .text('Price', 250, 250, { align: 'center' })
      .text('Total', 300, 250, { align: 'right' });
  
    doc.moveTo(50, 270).lineTo(550, 270).stroke();
  
    // Table Items
    let y = 280;
    doc.font('Helvetica').fontSize(12);
    order.items.forEach(item => {
      const total = item.price * item.quantity;
      doc
        .text(item.itemname, 50, y)
        .text(item.quantity.toString(), 100, y, { align: 'center' })
        .text(`$${item.price.toFixed(2)}`, 250, y, { align: 'center' })
        .text(`$${total.toFixed(2)}`, 300, y, { align: 'right' });
      y += 20;
    });
  
    // Subtotal / Delivery / Total
    y += 10;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 20;
  
    const subtotal = order.total;
    const delivery = order.deliveryFee || 0;
    const total = subtotal + delivery;
  
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 250, y, { align: 'center' });
    doc.text(`$${subtotal.toFixed(2)}`, 500, y, { align: 'right' });
  
    y += 20;
    doc.text('Delivery Fee:', 250, y, { align: 'center' });
    doc.text(`$${delivery.toFixed(2)}`, 500, y, { align: 'right' });
  
    y += 20;
    doc.fontSize(14).text('Total:', 250, y, { align: 'center' });
    doc.text(`$${total.toFixed(2)}`, 500, y, { align: 'right' });
  
    // Footer
    y += 60;
    doc
      .fontSize(10).font('Helvetica-Oblique')
      .text('Thank you for your business!', 50, y, { align: 'center', width: 500 })
      .text('Payment is due within 30 days.', 50, y + 15, { align: 'center', width: 500 })
      .text('For questions, contact support@Tech-Shop.com.', 50, y + 30, { align: 'center', width: 500 });
  
    doc.end();
  },
  
  
};

module.exports = globalController;
