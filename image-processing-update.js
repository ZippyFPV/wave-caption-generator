// Professional Image Processing Update for Server.js
// This contains the enhanced image processing logic to replace the existing one

// Replace the existing /api/process-image endpoint with this enhanced version:

app.post('/api/process-image', async (req, res) => {
  try {
    const { imageUrl, caption, width = 4200, height = 3300 } = req.body;
    
    console.log(`🎨 Processing image for ${width}x${height} canvas: ${imageUrl}`);
    console.log(`📝 Caption: "${caption}"`);
    
    // Load the original image
    const image = await loadImage(imageUrl);
    
    // Create canvas with Printify specifications
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background with white (in case image doesn't fill)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Professional image scaling: FILL canvas completely with smart cropping
    const imageAspect = image.width / image.height;
    const canvasAspect = width / height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      // Image is wider than canvas - fit to height and crop sides evenly
      drawHeight = height;
      drawWidth = height * imageAspect;
      drawX = (width - drawWidth) / 2; // Center horizontally
      drawY = 0;
    } else {
      // Image is taller than canvas - fit to width and crop from top (preserve subject)
      drawWidth = width;
      drawHeight = width / imageAspect;
      drawX = 0;
      // Crop from top 30% to preserve main subject (usually in center/lower)
      drawY = -(drawHeight - height) * 0.3; // Smart crop from top third
    }
    
    console.log(`🖼️ Image scaling: ${image.width}x${image.height} → ${Math.round(drawWidth)}x${Math.round(drawHeight)} at (${Math.round(drawX)}, ${Math.round(drawY)})`);
    
    // Draw the image
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    
    // Add professional caption overlay
    if (caption) {
      // Dynamic font sizing based on canvas width and text length
      const baseSize = Math.floor(width * 0.04); // 4% of width for better proportion
      const minSize = Math.max(40, width * 0.015); // Minimum size scales with canvas
      const maxSize = Math.min(120, width * 0.06); // Maximum size to prevent oversized text
      
      // Clean caption for display (remove brackets)
      const displayCaption = caption.replace(/[\[\]]/g, '').trim();
      
      // Adjust font size based on text length for optimal readability
      let fontSize = baseSize;
      if (displayCaption.length > 40) fontSize = Math.max(minSize, baseSize * 0.85);
      if (displayCaption.length > 60) fontSize = Math.max(minSize, baseSize * 0.75);
      fontSize = Math.min(fontSize, maxSize);
      
      // Professional typography setup
      ctx.font = `bold ${fontSize}px "Helvetica Neue", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate text dimensions for responsive background
      const textMetrics = ctx.measureText(displayCaption);
      const textWidth = textMetrics.width;
      const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
      
      // Smart positioning: avoid critical image areas
      const textX = width / 2;
      let textY = height * 0.82; // Lower position for better composition
      
      // Ensure text doesn't go off canvas
      const minY = actualHeight / 2 + 20;
      const maxY = height - actualHeight / 2 - 20;
      textY = Math.max(minY, Math.min(maxY, textY));
      
      // Professional background with responsive padding
      const paddingX = Math.max(30, fontSize * 0.8);
      const paddingY = Math.max(20, fontSize * 0.4);
      const bgHeight = actualHeight + paddingY * 2;
      const bgWidth = textWidth + paddingX * 2;
      
      // Gradient background for depth
      const gradient = ctx.createLinearGradient(0, textY - bgHeight/2, 0, textY + bgHeight/2);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      
      // Draw background with subtle border
      ctx.fillStyle = gradient;
      ctx.fillRect(
        textX - bgWidth / 2,
        textY - bgHeight / 2,
        bgWidth,
        bgHeight
      );
      
      // Add subtle border for definition
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        textX - bgWidth / 2,
        textY - bgHeight / 2,
        bgWidth,
        bgHeight
      );
      
      // High-contrast text with subtle shadow
      // Text shadow for better readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText(displayCaption, textX + 2, textY + 2);
      
      // Main text in bright, readable gold
      ctx.fillStyle = '#FFD700'; // Gold color for premium feel
      ctx.fillText(displayCaption, textX, textY);
      
      console.log(`⭐ Applied professional caption: "${displayCaption}" (${fontSize}px font, ${width}x${height} canvas)`);
    }
    
    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    const processedImageData = {
      dataUrl,
      width,
      height,
      caption,
      originalUrl: imageUrl,
      processed: true,
      timestamp: Date.now()
    };
    
    console.log(`✅ Professional image processed: ${width}x${height} with optimized caption overlay`);
    console.log(`📊 Final specs: scaled image + professional typography`);
    res.json(processedImageData);
    
  } catch (error) {
    console.error('❌ Image processing failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});