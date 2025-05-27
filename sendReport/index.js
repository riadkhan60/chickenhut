const express = require('express');
const { Client } = require('pg');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
require('moment-timezone'); // Add timezone support
// Remove SendGrid for email
// const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Configuration - Update these with your actual details
const config = {
  database: {
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:riad1234@localhost:5432/chikenhut?schema=public',
  },
  email: {
    from: 'riad50@zohomail.com', // Your Zoho Mail address
    to: 'qbexel@gmail.com',
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'riad50@zohomail.com', // Your Zoho Mail address
      pass: '+super60', // App password or account password
    },
  },
  server: {
    port: 3006,
  },
};

// Create Express application
const app = express();

// Database connection client
let client;
let reportCronJob = null;
let lastReportTime = null;
let isProcessingReport = false; // Add flag to track if a report is being processed

// Initialize database connection
async function initDb() {
  try {
    client = new Client(config.database);
    await client.connect();
    console.log('PostgreSQL database connected');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
    process.exit(1);
  }
}

// Function to add 6 hours to a datetime string in DD-MM-YYYY HH:MM:SS AM/PM format
function addSixHours(dateTimeStr) {
  // Parse input string using regex to extract parts
  const [datePart, timePart, meridian] = dateTimeStr.split(' ');
  const [day, month, year] = datePart.split('-').map(Number);
  const [hour12, minute, second] = timePart.split(':').map(Number);

  // Convert 12-hour format to 24-hour
  let hour24 = hour12 % 12;
  if (meridian.toUpperCase() === 'PM') hour24 += 12;

  // Create a Date object
  const date = new Date(year, month - 1, day, hour24, minute, second);

  // Add 6 hours
  date.setHours(date.getHours() + 6);

  // Format the output
  const newDay = String(date.getDate()).padStart(2, '0');
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newYear = date.getFullYear();

  let newHour = date.getHours();
  const newMinute = String(date.getMinutes()).padStart(2, '0');
  const newSecond = String(date.getSeconds()).padStart(2, '0');

  const newMeridian = newHour >= 12 ? 'PM' : 'AM';
  newHour = newHour % 12 || 12; // Convert to 12-hour format and handle midnight

  const newHourStr = String(newHour).padStart(2, '0');

  return `${newDay}-${newMonth}-${newYear} ${newHourStr}:${newMinute}:${newSecond} ${newMeridian}`;
}

// Generate PDF report of orders
async function generateOrderReport(orders) {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document with automatic page management
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true, // Important for proper page numbering
      });

      const filePath = path.join(
        __dirname,
        `orders_report_${moment().tz('Asia/Dhaka').format('YYYY-MM-DD')}.pdf`,
      );
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Document measurements
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const contentWidth =
        pageWidth - (doc.page.margins.left + doc.page.margins.right);
      const footerHeight = 30; // Space reserved for footer
      const headerHeight = 120; // Space for header on continued pages

      // Define column positions with proper alignment
      const columns = {
        orderId: { x: 50, width: 70, align: 'left' },
        table: { x: 150, width: 70, align: 'center' },
        total: { x: 250, width: 70, align: 'right' },
        orderedAt: { x: 350, width: 150, align: 'center' },
      };

      // Function to convert date to Bangladesh timezone and add 6 hours
      const formatBangladeshTime = (dateStr) => {
        const bdTime = moment(dateStr)
          .tz('Asia/Dhaka')
          .format('DD-MM-YYYY hh:mm:ss A');
        // Add 6 hours to the formatted time
        return addSixHours(bdTime);
      };

      // Function to add header to pages
      const addHeader = (isFirstPage) => {
        if (isFirstPage) {
          // First page header
          doc
            .fontSize(22)
            .font('Helvetica-Bold')
            .text('Restaurant Orders Report', { align: 'center' });
          doc.moveDown(0.5);

          const currentTime = moment().tz('Asia/Dhaka');

          doc
            .fontSize(14)
            .font('Helvetica')
            .text(`Date: ${currentTime.format('MMMM Do, YYYY')}`, {
              align: 'center',
            });
          doc.moveDown(0.5);

          doc
            .fontSize(12)
            .text(`Generated at: ${currentTime.format('hh:mm:ss A')}`, {
              align: 'center',
            });
          doc.moveDown(1.5);

          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(`Orders Completed Before 8 PM (${orders.length} orders)`, {
              underline: true,
            });
          doc.moveDown(1);
        } else {
          // Continuation page header
          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('Restaurant Orders Report - Continued', { align: 'center' });
          doc.moveDown(1);
        }

        // Column headers (same on all pages)
        doc.fontSize(12).font('Helvetica-Bold');

        const headerY = doc.y;
        doc.text('Order ID', columns.orderId.x, headerY, {
          width: columns.orderId.width,
          align: columns.orderId.align,
        });

        doc.text('Table', columns.table.x, headerY, {
          width: columns.table.width,
          align: columns.table.align,
        });

        doc.text('Total', columns.total.x, headerY, {
          width: columns.total.width,
          align: columns.total.align,
        });

        doc.text('Ordered Time', columns.orderedAt.x, headerY, {
          width: columns.orderedAt.width,
          align: columns.orderedAt.align,
        });

        doc.moveDown(0.75);

        // Draw header separator line
        doc
          .moveTo(50, doc.y)
          .lineTo(pageWidth - 50, doc.y)
          .strokeColor('#000000')
          .lineWidth(1)
          .stroke();

        doc.moveDown(0.5);

        return doc.y; // Return current Y position after header
      };

      // Add footer to all pages
      const addFooter = (pageNum, totalPages) => {
        doc
          .fontSize(9)
          .font('Helvetica')
          .text(
            `Page ${pageNum} of ${totalPages}`,
            0,
            pageHeight - doc.page.margins.bottom - 15,
            { align: 'center', width: pageWidth },
          );
      };

      // Check available space and add new page if needed
      const checkNewPage = (height) => {
        const bottomMargin = doc.page.margins.bottom + footerHeight;
        const availableSpace = pageHeight - bottomMargin - doc.y;

        if (availableSpace < height) {
          doc.addPage();
          addHeader(false);
          return true;
        }
        return false;
      };

      // Start with first page header
      addHeader(true);

      // Calculate total for summary
      const totalAmount = orders.reduce(
        (sum, order) => sum + parseFloat(order.total),
        0,
      );

      // Process orders
      doc.font('Helvetica').fontSize(11);
      orders.forEach((order, index) => {
        // Check space for a complete order row (including items)
        const rowHeight = 60; // Estimated height for a row with items
        checkNewPage(rowHeight);

        // Save Y position at the start of this row
        const rowY = doc.y;

        // Draw Order ID
        doc.fontSize(11).font('Helvetica');
        doc.text(
          order.order_id !== null ? order.order_id.toString() : '',
          columns.orderId.x,
          rowY,
          {
            width: columns.orderId.width,
            align: columns.orderId.align,
          },
        );

        // Draw Table
        doc.text(
          order.table_number !== null ? order.table_number.toString() : 'p',
          columns.table.x,
          rowY,
          {
            width: columns.table.width,
            align: columns.table.align,
          },
        );

        // Draw Total
        doc.text(`${parseInt(order.total)}`, columns.total.x, rowY, {
          width: columns.total.width,
          align: columns.total.align,
        });

        // Draw Ordered At (using createdAt)
        doc.text(
          formatBangladeshTime(order.createdAt),
          columns.orderedAt.x,
          rowY,
          {
            width: columns.orderedAt.width,
            align: columns.orderedAt.align,
          },
        );

        // Move down for items
        doc.moveDown(1);

        // Items row (check if we need a new page)
        if (checkNewPage(25)) {
          // If we added a new page, we need to redraw the order info
          const newRowY = doc.y;

          doc.fontSize(11).font('Helvetica');
          doc.text(
            order.order_id !== null ? order.order_id.toString() : '',
            columns.orderId.x,
            newRowY,
            {
              width: columns.orderId.width,
              align: columns.orderId.align,
            },
          );

          doc.text(
            order.table_number !== null ? order.table_number.toString() : '',
            columns.table.x,
            newRowY,
            {
              width: columns.table.width,
              align: columns.table.align,
            },
          );

          doc.text(`${parseInt(order.total)}`, columns.total.x, newRowY, {
            width: columns.total.width,
            align: columns.total.align,
          });

          doc.text(
            formatBangladeshTime(order.createdAt),
            columns.orderedAt.x,
            newRowY,
            {
              width: columns.orderedAt.width,
              align: columns.orderedAt.align,
            },
          );

          doc.moveDown(1);
        }

        // Draw Items with indentation
        doc.font('Helvetica-Oblique').fontSize(10);
        doc.text(
          `Items: ${order.items_summary}`,
          columns.orderId.x + 15,
          doc.y,
          { width: contentWidth - 65 },
        );

        // Reset font and add spacing
        doc.font('Helvetica').fontSize(11);
        doc.moveDown(1);

        // Add separator between rows except for the last one
        if (index < orders.length - 1) {
          doc
            .moveTo(50, doc.y)
            .lineTo(pageWidth - 50, doc.y)
            .strokeColor('#dddddd')
            .lineWidth(0.5)
            .stroke();

          doc.moveDown(0.5);
        }
      });

      // Check if we need a new page for the summary
      checkNewPage(70);

      // Add separator before total
      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(pageWidth - 50, doc.y)
        .strokeColor('#000000')
        .lineWidth(1)
        .stroke();

      doc.moveDown(1);

      // Add total amount
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(`Total Revenue: ${parseInt(totalAmount)} tk`, 0, doc.y, {
          align: 'right',
          width: pageWidth - 100,
        });

      // Get total page count
      const totalPages = doc.bufferedPageRange().count;

      // Add page numbers to each page
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        addFooter(i + 1, totalPages);
      }

      // Finalize the PDF
      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Send email with PDF attachment using nodemailer (Zoho Mail)
async function sendEmailWithReport(pdfPath) {
  try {
    const today = moment().format('YYYY-MM-DD');
    // Create a transporter for Zoho Mail
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth,
    });
    // Prepare the email
    const mailOptions = {
      from: config.email.from,
      to: config.email.to,
      subject: `Restaurant Orders Report - ${today}`,
      text: `Please find attached the restaurant orders report for ${today} with all orders completed before 8 PM.`,
      attachments: [
        {
          filename: path.basename(pdfPath),
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    };
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent with Zoho Mail:', info.messageId);
    // Delete the PDF after sending
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    } else {
      console.log(
        `Warning: Could not delete file ${pdfPath} as it does not exist`,
      );
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Fetch all orders that haven't been reported yet (sendStatement = false)
async function fetchUnreportedOrders() {
  try {
    const query = `
      SELECT 
        o.id as order_id,
        t.number as table_number,
        o."completedAt",
        o."createdAt",
        o.total,
        STRING_AGG(CONCAT(oi.quantity, 'x ', m.name, ' (itm-no:', m."itemNumber", ')'), ', ') as items_summary
      FROM 
        "Order" o
      LEFT JOIN 
        "Table" t ON o."tableId" = t.id
      JOIN 
        "OrderItem" oi ON o.id = oi."orderId"
      JOIN 
        "MenuItem" m ON oi."menuItemId" = m.id
      WHERE 
        o."completedAt" IS NOT NULL
        AND o.status = 'COMPLETED'
        AND o."sendStatement" = false
      GROUP BY 
        o.id, t.number, o."completedAt", o."createdAt", o.total
      ORDER BY 
        o."completedAt" ASC
    `;
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Mark orders as reported in the database
async function markOrdersAsReported(orderIds) {
  try {
    if (!orderIds || orderIds.length === 0) {
      return;
    }
    // Update all orders to set sendStatement to true
    const query = `
      UPDATE "Order"
      SET "sendStatement" = true
      WHERE id = ANY($1)
    `;
    await client.query(query, [orderIds]);
    console.log(`Marked ${orderIds.length} orders as reported in the database`);
  } catch (error) {
    console.error('Error marking orders as reported:', error);
    throw error;
  }
}

// Fetch report sending time from the database
async function fetchReportSendingTime() {
  try {
    const result = await client.query(
      'SELECT time FROM "ReportSendingTime" ORDER BY id DESC LIMIT 1',
    );
    if (result.rows.length > 0) {
      return result.rows[0].time; // e.g., "20:00"
    }
    // Default to 20:00 (8 PM) if not set
    return '20:00';
  } catch (error) {
    console.error('Error fetching report sending time:', error);
    return '20:00';
  }
}

function timeToCron(timeStr) {
  // timeStr: "20:00"
  const [hour, minute] = timeStr.split(':').map(Number);
  // Cron format: "m h * * *"
  return `${minute} ${hour} * * *`;
}

async function scheduleReportJob() {
  const sendingTime = await fetchReportSendingTime();
  if (sendingTime === lastReportTime && reportCronJob) {
    // No change, do nothing
    return;
  }
  lastReportTime = sendingTime;

  // Stop previous job if exists
  if (reportCronJob) {
    reportCronJob.stop();
    reportCronJob = null;
  }

  const cronTime = timeToCron(sendingTime);
  reportCronJob = cron.schedule(cronTime, async () => {
    console.log(
      `Scheduled job triggered: Generating and sending report at ${sendingTime}`,
    );

    // Prevent multiple concurrent executions
    if (isProcessingReport) {
      console.log(
        'A report is already being processed. Skipping this execution.',
      );
      return;
    }

    isProcessingReport = true;

    try {
      const orders = await fetchUnreportedOrders();
      if (orders.length === 0) {
        console.log('No unreported completed orders found');
        isProcessingReport = false;
        return;
      }
      const pdfPath = await generateOrderReport(orders);
      await sendEmailWithReport(pdfPath);
      const orderIds = orders.map((order) => order.order_id);
      await markOrdersAsReported(orderIds);
      console.log(
        `Scheduled report sent successfully with ${orders.length} orders`,
      );
    } catch (error) {
      console.error('Error in scheduled report job:', error);
    } finally {
      isProcessingReport = false;
    }
  });

  console.log(`Report job scheduled for ${sendingTime} (cron: ${cronTime})`);
}

function startReportTimeWatcher() {
  setInterval(scheduleReportJob, 60 * 1000); // Check every 60 seconds
}

// API endpoint to generate and send report
app.get('/generate-report', async (req, res) => {
  try {
    // Check if a report is already being processed
    if (isProcessingReport) {
      return res.status(423).json({
        success: false,
        message: 'A report is already being processed. Please try again later.',
      });
    }

    isProcessingReport = true;

    // Fetch orders
    const orders = await fetchUnreportedOrders();

    if (orders.length === 0) {
      isProcessingReport = false;
      return res.status(404).json({
        success: false,
        message: 'No unreported completed orders found',
      });
    }

    // Generate PDF report
    const pdfPath = await generateOrderReport(orders);

    // Send email with PDF
    await sendEmailWithReport(pdfPath);

    // Mark orders as reported
    const orderIds = orders.map((order) => order.order_id);
    await markOrdersAsReported(orderIds);

    // Response
    res.json({
      success: true,
      message: 'Orders report generated and emailed successfully',
      orders_count: orders.length,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate and send report',
      error: error.message,
    });
  } finally {
    isProcessingReport = false;
  }
});

// Direct execution endpoint for Python to call
app.get('/run-report', async (req, res) => {
  try {
    // Check if a report is already being processed
    if (isProcessingReport) {
      return res.status(423).json({
        success: false,
        message: 'A report is already being processed. Please try again later.',
      });
    }

    isProcessingReport = true;

    // Fetch orders
    const orders = await fetchUnreportedOrders();

    if (orders.length === 0) {
      console.log('No unreported completed orders found');
      isProcessingReport = false;
      return res.json({
        success: true,
        message: 'No unreported completed orders found',
      });
    }

    // Generate PDF report
    const pdfPath = await generateOrderReport(orders);

    // Send email with PDF
    await sendEmailWithReport(pdfPath);

    // Mark orders as reported
    const orderIds = orders.map((order) => order.order_id);
    await markOrdersAsReported(orderIds);

    console.log(`Report sent successfully with ${orders.length} orders`);

    res.json({
      success: true,
      message: 'Orders report generated and emailed successfully',
      orders_count: orders.length,
    });
  } catch (error) {
    console.error('Error in run-report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate and send report',
      error: error.message,
    });
  } finally {
    isProcessingReport = false;
  }
});

// Utility function to generate PDF report without sending email (for testing)
async function generatePdfOnly(options = {}) {
  try {
    // Default options
    const defaults = {
      useTestData: false,
      orderLimit: null,
      includeReported: false,
    };

    const config = { ...defaults, ...options };

    // Determine which orders to include
    let orders;
    if (config.useTestData) {
      // Generate some test data if requested
      orders = generateTestOrders(config.orderLimit || 5);
    } else {
      // Fetch orders with optional parameters
      let query = `
        SELECT 
          o.id as order_id,
          t.number as table_number,
          o."completedAt",
          o."createdAt",
          o.total,
          STRING_AGG(CONCAT(oi.quantity, 'x ', m.name, ' (itm-no:', m."itemNumber", ')'), ', ') as items_summary
        FROM 
          "Order" o
        LEFT JOIN 
          "Table" t ON o."tableId" = t.id
        JOIN 
          "OrderItem" oi ON o.id = oi."orderId"
        JOIN 
          "MenuItem" m ON oi."menuItemId" = m.id
        WHERE 
          o."completedAt" IS NOT NULL
          AND o.status = 'COMPLETED'
      `;

      if (!config.includeReported) {
        query += `AND o."sendStatement" = false `;
      }

      query += `
        GROUP BY 
          o.id, t.number, o."completedAt", o."createdAt", o.total
        ORDER BY 
          o."completedAt" ASC
      `;

      if (config.orderLimit) {
        query += `LIMIT ${config.orderLimit}`;
      }

      const result = await client.query(query);
      orders = result.rows;
    }

    if (orders.length === 0) {
      return { success: false, message: 'No orders found for PDF generation' };
    }

    // Generate PDF without sending email
    const pdfPath = await generateOrderReport(orders);

    return {
      success: true,
      message: 'PDF generated successfully',
      pdfPath,
      ordersCount: orders.length,
    };
  } catch (error) {
    console.error('Error generating PDF only:', error);
    return {
      success: false,
      message: 'Failed to generate PDF',
      error: error.message,
    };
  }
}

// Generate sample test orders for PDF testing
function generateTestOrders(count = 5) {
  const orders = [];
  const now = moment().tz('Asia/Dhaka');

  for (let i = 1; i <= count; i++) {
    const orderTime = moment(now).subtract(i * 30, 'minutes');

    orders.push({
      order_id: 1000 + i,
      table_number: Math.floor(Math.random() * 20) + 1,
      completedAt: orderTime.toISOString(),
      createdAt: orderTime.subtract(30, 'minutes').toISOString(),
      total: (Math.random() * 1000 + 500).toFixed(2),
      items_summary:
        `${Math.floor(Math.random() * 3) + 1}x Chicken Burger (itm-no:101), ` +
        `${Math.floor(Math.random() * 2) + 1}x French Fries (itm-no:201), ` +
        `${Math.floor(Math.random() * 2) + 1}x Coke (itm-no:301)`,
    });
  }

  return orders;
}

// API endpoint to generate PDF only (for testing purposes)
app.get('/test-pdf', async (req, res) => {
  try {
    const useTestData = req.query.useTestData === 'true';
    const orderLimit = req.query.limit ? parseInt(req.query.limit) : null;
    const includeReported = req.query.includeReported === 'true';

    const result = await generatePdfOnly({
      useTestData,
      orderLimit,
      includeReported,
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    // If client requests download, send the file
    if (req.query.download === 'true') {
      return res.download(
        result.pdfPath,
        path.basename(result.pdfPath),
        (err) => {
          if (err) {
            console.error('Error sending PDF file:', err);
          } else {
            // Delete file after sending (optional)
            if (fs.existsSync(result.pdfPath)) {
              fs.unlinkSync(result.pdfPath);
            }
          }
        },
      );
    }

    // Otherwise just return success response with file path
    res.json(result);
  } catch (error) {
    console.error('Error in test-pdf endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test PDF',
      error: error.message,
    });
  }
});

// Start server
async function startServer() {
  try {
    await initDb();

    // Check if port is already in use before starting the server
    const net = require('net');
    const testServer = net
      .createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(
            `Port ${config.server.port} is already in use. Another instance of this server may be running.`,
          );
          console.error('Exiting to prevent duplicate reports and emails.');
          process.exit(1);
        }
      })
      .once('listening', () => {
        testServer.close();
        continueStartup();
      })
      .listen(config.server.port);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function continueStartup() {
  try {
    await scheduleReportJob(); // Initial schedule
    startReportTimeWatcher(); // Start watcher

    app.listen(config.server.port, () => {
      console.log(
        `Restaurant report server running on port ${config.server.port}`,
      );
    });
  } catch (error) {
    console.error('Failed during server startup:', error);
    process.exit(1);
  }
}

// Start the server when this script is run directly
if (require.main === module) {
  startServer();
}

// Export for external use (e.g., by your Python script)
module.exports = { app, startServer };
