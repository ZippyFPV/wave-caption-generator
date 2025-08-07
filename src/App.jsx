import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Fab,
  Modal,
  Backdrop,
  IconButton,
} from "@mui/material";
import {
  Download,
  CloudDownload,
  Refresh,
  Warning,
  PhotoCamera,
  Close,
  ZoomIn,
} from "@mui/icons-material";

const WaveCaptionGenerator = () => {
  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get API key from Vite environment variables
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  // Caption variations - Massive collection for accessibility compliance and variety
  const captions = [
    "[Wave crashing]",
    "[Waves crashing]",
    "[Ocean waves crashing]",
    "[Large wave crashing]",
    "[Crashing waves]",
    "[Surf crashing]",
    "[Powerful waves crashing]",
    "[Ocean surf breaking]",
    "[Dramatic wave crash]",
    "[Thunderous waves breaking]",
    "[Massive surf impact]",
    "[White water cascading]",
    "[Foaming waves crashing]",
    "[Turbulent ocean waves]",
    "[Rolling waves breaking]",
    "[Churning white water]",
    "[Explosive wave impact]",
    "[Surging ocean foam]",
    "[Violent waves crashing]",
    "[Majestic wave formation]",
    "[Towering wave collapse]",
    "[Relentless surf pounding]",
    "[Dynamic wave motion]",
    "[Cascading ocean spray]",
    "[Rhythmic wave breaks]",
    "[Powerful surf surge]",
    "[Endless wave cycle]",
    "[Spectacular wave display]",
    "[Nature's wave symphony]",
    "[Oceanic force unleashed]",
    "[Pristine wave formation]",
    "[Crystalline water crashing]",
    "[Azure waves breaking]",
    "[Emerald surf rolling]",
    "[Sapphire ocean swells]",
    "[Turquoise waves dancing]",
    "[Deep blue wave crash]",
    "[Midnight ocean surge]",
    "[Golden hour wave break]",
    "[Sunset waves crashing]",
    "[Storm waves advancing]",
    "[Gentle waves lapping]",
    "[Serene wave motion]",
    "[Peaceful surf sounds]",
    "[Tranquil wave rhythm]",
    "[Soothing ocean melody]",
    "[Calming wave patterns]",
    "[Meditative wave flow]",
    "[Hypnotic wave dance]",
    "[Zen-like wave movement]",
    "[Colossal wave thundering]",
    "[Magnificent surf roaring]",
    "[Epic wave collision]",
    "[Untamed ocean fury]",
    "[Breathtaking wave power]",
    "[Monumental sea crash]",
    "[Incredible wave energy]",
    "[Stupendous surf force]",
    "[Awe-inspiring wave break]",
    "[Phenomenal ocean display]",
    "[Extraordinary wave motion]",
    "[Remarkable surf action]",
    "[Outstanding wave performance]",
    "[Exceptional sea movement]",
    "[Unbelievable wave show]",
    "[Amazing ocean spectacle]",
    "[Fantastic wave exhibition]",
    "[Wonderful surf demonstration]",
    "[Marvelous wave presentation]",
    "[Splendid ocean performance]",
    "[Glorious wave manifestation]",
    "[Brilliant surf showcase]",
    "[Radiant wave illumination]",
    "[Luminous ocean glow]",
    "[Shimmering wave reflection]",
    "[Glistening surf sparkle]",
    "[Gleaming water dance]",
    "[Dazzling wave brilliance]",
    "[Sparkling ocean jewels]",
    "[Twinkling surf diamonds]",
    "[Glittering wave crystals]",
    "[Iridescent water magic]",
    "[Opalescent wave beauty]",
    "[Pearlescent surf elegance]",
    "[Silvery wave shimmer]",
    "[Golden surf gleaming]",
    "[Platinum wave shine]",
    "[Diamond-bright ocean spray]",
    "[Liquid silver crashing]",
    "[Molten gold waves]",
    "[Flowing mercury surf]",
    "[Dancing water spirits]",
    "[Whispering wave voices]",
    "[Singing ocean chorus]",
    "[Harmonious surf melody]",
    "[Melodic wave symphony]",
    "[Rhythmic ocean beats]",
    "[Pulsing wave heartbeat]",
    "[Breathing sea rhythm]",
    "[Living water essence]",
    "[Eternal wave cycle]",
    "[Timeless ocean dance]",
    "[Ancient wave wisdom]",
    "[Primal surf energy]",
    "[Elemental water force]",
    "[Cosmic ocean power]",
    "[Universal wave flow]",
    "[Infinite sea motion]",
    "[Boundless wave freedom]",
    "[Limitless ocean spirit]",
    "[Wild surf expression]",
    "[Free-flowing wave art]",
    "[Spontaneous ocean joy]",
    "[Playful wave laughter]",
    "[Joyous surf celebration]",
    "[Exuberant wave festival]",
    "[Jubilant ocean party]",
    "[Festive surf gathering]",
    "[Cheerful wave reunion]",
    "[Happy ocean meeting]",
    "[Delightful surf encounter]",
    "[Pleasant wave greeting]",
    "[Friendly ocean welcome]",
    "[Warm surf embrace]",
    "[Gentle wave caress]",
    "[Soft ocean touch]",
    "[Tender surf kiss]",
    "[Sweet wave whisper]",
    "[Loving ocean hug]",
    "[Caring surf comfort]",
    "[Nurturing wave support]",
    "[Protective ocean shelter]",
    "[Safe surf haven]",
    "[Secure wave refuge]",
    "[Peaceful ocean sanctuary]",
    "[Tranquil surf retreat]",
    "[Quiet wave solitude]",
    "[Silent ocean meditation]",
    "[Hushed surf contemplation]",
    "[Subdued wave reflection]",
    "[Muted ocean thoughts]",
    "[Whispered surf secrets]",
    "[Murmured wave mysteries]",
    "[Soft ocean lullaby]",
    "[Gentle surf serenade]",
    "[Tender wave ballad]",
    "[Sweet ocean song]",
    "[Melodious surf tune]",
    "[Harmonious wave music]",
    "[Symphonic ocean composition]",
    "[Orchestral surf arrangement]",
    "[Musical wave performance]",
    "[Acoustic ocean concert]",
    "[Live surf show]",
    "[Dynamic wave theater]",
    "[Dramatic ocean stage]",
    "[Epic surf production]",
    "[Grand wave finale]",
  ];

  // SEO-optimized names that are both searchable and funny
  const seoOptimizedNames = [
    "Ocean Wave Wall Art - Monday Morning Motivation Print",
    "Blue Wave Photography - Stress Relief Office Decor",
    "Coastal Wave Print - Mindfulness Meditation Art",
    "Ocean Therapy Wall Decor - Mental Health Awareness",
    "Crashing Wave Canvas - Workplace Wellness Art",
    "Sea Wave Poster - Anxiety Support Office Print",
    "Ocean Photography - Coffee Shop Wall Art Decor",
    "Wave Crash Print - Productivity Motivation Poster",
    "Coastal Decor - Ocean Wave Inspirational Art",
    "Blue Wave Canvas - Therapy Office Wall Decor",
    "Ocean Wall Art - Millennial Humor Home Decor",
    "Wave Photography Print - Funny Office Poster",
    "Coastal Wave Art - Mental Health Support Decor",
    "Ocean Poster - Workplace Humor Wall Print",
    "Sea Wave Canvas - Motivational Office Art",
    "Crashing Wave Decor - Stress Management Print",
    "Ocean Photography - Minimalist Wall Art",
    "Wave Print - Modern Office Decor Poster",
    "Coastal Art - Ocean Wave Meditation Print",
    "Blue Wave Poster - Therapeutic Wall Decor",
  ];

  // File-safe versions for downloads (SEO + URL friendly)
  const generateSEOFilename = (title, index) => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Remove duplicate hyphens
        .trim() + `_${index + 1}`
    );
  };

  const fetchImages = async () => {
    if (!apiKey) {
      setError("Please add your Pexels API key to the .env file");
      return;
    }

    setLoading(true);
    setError("");
    console.log("Starting to fetch images from Pexels...");

    try {
      // Fetch multiple pages to get more images
      const promises = [];
      for (let page = 1; page <= 3; page++) {
        promises.push(
          fetch(
            `https://api.pexels.com/v1/search?query=ocean waves crashing&per_page=15&page=${page}`,
            {
              method: "GET",
              headers: {
                Authorization: apiKey,
                Accept: "application/json",
              },
            },
          ),
        );
      }

      const responses = await Promise.all(promises);

      // Check if any requests failed
      for (let response of responses) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await Promise.all(responses.map((res) => res.json()));
      const allImages = data.flatMap((d) => d.photos || []);

      console.log(`Fetched ${allImages.length} images from Pexels`);
      setImages(allImages);

      // Process images with captions
      await processImagesWithCaptions(allImages);
    } catch (error) {
      console.error("Detailed error:", error);

      if (error.message.includes("401")) {
        setError(
          "Authentication Error: Please check your Pexels API key is correct.",
        );
      } else if (error.message.includes("429")) {
        setError(
          "Rate limit exceeded. Please wait before making more requests.",
        );
      } else if (error.message.includes("Failed to fetch")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(`Error fetching images: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const processImagesWithCaptions = async (imageList) => {
    console.log(
      "Processing images with captions...",
      imageList.length,
      "images",
    );
    const processed = [];

    // Limit to 20 images to avoid overwhelming the browser
    const imagesToProcess = imageList.slice(0, 20);

    for (let i = 0; i < imagesToProcess.length; i++) {
      const image = imagesToProcess[i];
      const randomCaption =
        captions[Math.floor(Math.random() * captions.length)];
      const randomName =
        seoOptimizedNames[Math.floor(Math.random() * seoOptimizedNames.length)];

      console.log(`Processing image ${i + 1}/${imagesToProcess.length}`);

      try {
        const processedImageUrl = await addCaptionToImage(
          image.src.large,
          randomCaption,
        );
        processed.push({
          id: image.id,
          original: image.src.large,
          processed: processedImageUrl,
          caption: randomCaption,
          name: randomName,
          photographer: image.photographer,
          photographer_url: image.photographer_url,
        });
        console.log(`Successfully processed image ${i + 1}`);
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
      }
    }

    console.log("Finished processing. Total processed:", processed.length);
    setProcessedImages(processed);
  };

  const addCaptionToImage = (imageUrl, caption) => {
    return new Promise((resolve, reject) => {
      console.log("Processing image:", imageUrl, "with caption:", caption);

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          console.log(
            "Image loaded successfully, dimensions:",
            img.width,
            "x",
            img.height,
          );

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Ensure minimum canvas size
          canvas.width = Math.max(img.width, 800);
          canvas.height = Math.max(img.height, 600);

          // Draw the original image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Set up text styling with enhanced visibility
          const fontSize = Math.max(32, canvas.width * 0.03);
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Measure text for background
          const textMetrics = ctx.measureText(caption);
          const textWidth = textMetrics.width;
          const textHeight = fontSize * 1.4;
          const padding = 32;

          // Calculate positions for perfect centering
          const rectWidth = textWidth + padding * 2;
          const rectHeight = textHeight + padding;
          const rectX = (canvas.width - rectWidth) / 2;
          const rectY = canvas.height - rectHeight - 50;

          // Draw black background rectangle with border
          ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
          ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

          // Add border to make it more visible
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = 2;
          ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

          // Draw yellow text with enhanced shadow
          ctx.fillStyle = "#FFFF00";
          ctx.shadowColor = "rgba(0, 0, 0, 1)";
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          ctx.shadowBlur = 6;

          ctx.fillText(caption, canvas.width / 2, rectY + rectHeight / 2);

          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;

          console.log("Caption added successfully to image");
          const dataURL = canvas.toDataURL("image/jpeg", 0.92);
          resolve(dataURL);
        } catch (error) {
          console.error("Canvas processing error:", error);
          // Return original image if processing fails
          resolve(imageUrl);
        }
      };

      img.onerror = (error) => {
        console.error("Image load error for URL:", imageUrl, error);
        // Return original image if load fails
        resolve(imageUrl);
      };

      // Add timeout to prevent hanging
      setTimeout(() => {
        if (!img.complete) {
          console.warn("Image load timeout for:", imageUrl);
          resolve(imageUrl);
        }
      }, 10000);

      img.src = imageUrl;
    });
  };

  const downloadImage = (imageData, fileName) => {
    const link = document.createElement("a");
    link.download = `${fileName}.jpg`;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    processedImages.forEach((image, index) => {
      setTimeout(() => {
        const seoFilename = generateSEOFilename(image.name, index);
        downloadImage(image.processed, seoFilename);
      }, index * 100); // Small delay between downloads
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #1976d2, #42a5f5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
            }}
          >
            Ocean Wave Caption Generator
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 800, mx: "auto" }}
          >
            Generate SEO-optimized captioned wave prints for your wall art
            empire!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Perfect for coffee shops, offices, and therapeutic spaces
          </Typography>

          {!apiKey && (
            <Alert
              severity="error"
              icon={<Warning />}
              sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
            >
              <Typography variant="subtitle2" gutterBottom>
                API Key Missing
              </Typography>
              <Typography variant="body2">
                Add your Pexels API key to the .env file:{" "}
                <code>VITE_PEXELS_API_KEY=your_key_here</code>
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              icon={<Warning />}
              sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Error
              </Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          <Box
            display="flex"
            gap={2}
            justifyContent="center"
            alignItems="center"
            mb={4}
            flexWrap="wrap"
          >
            <Button
              variant="contained"
              size="large"
              onClick={fetchImages}
              disabled={loading || !apiKey}
              startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1565c0, #1976d2)",
                },
              }}
            >
              {loading ? "Generating Wave Art..." : "Generate Wave Art"}
            </Button>
          </Box>

          {processedImages.length > 0 && (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={downloadAllImages}
              startIcon={<CloudDownload />}
              sx={{
                px: 4,
                py: 2,
                borderRadius: 3,
                mb: 4,
                background: "linear-gradient(45deg, #2e7d32, #4caf50)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1b5e20, #2e7d32)",
                },
              }}
            >
              Download All Images ({processedImages.length})
            </Button>
          )}
        </Box>

        {loading && (
          <Box textAlign="center" my={6}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Fetching ocean waves and adding captions...
            </Typography>
          </Box>
        )}

        <Grid container spacing={3} sx={{ justifyContent: "center" }}>
          {processedImages.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Paper
                elevation={8}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "#fafafa",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    elevation: 12,
                    transform: "translateY(-8px) rotate(0.5deg)",
                    "& .zoom-icon": {
                      opacity: 1,
                    },
                  },
                  transform: `rotate(${((index % 3) - 1) * 0.5}deg)`,
                  maxWidth: 380,
                  mx: "auto",
                }}
              >
                <Card
                  sx={{
                    borderRadius: 0,
                    boxShadow: "none",
                    bgcolor: "white",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Box position="relative">
                    <CardMedia
                      component="img"
                      height="300"
                      image={image.processed}
                      alt={`${image.name} - ${image.caption}`}
                      sx={{
                        objectFit: "cover",
                        display: "block",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          opacity: 0.8,
                          transform: "scale(1.02)",
                        },
                      }}
                      onClick={() => {
                        setSelectedImage(image);
                        setModalOpen(true);
                      }}
                    />
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(0,0,0,0.8)",
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        bgcolor: "rgba(255,255,255,0.9)",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,1)",
                        },
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                        ".MuiPaper-root:hover &": {
                          opacity: 1,
                        },
                      }}
                      size="small"
                      onClick={() => {
                        setSelectedImage(image);
                        setModalOpen(true);
                      }}
                    >
                      <ZoomIn fontSize="small" />
                    </IconButton>
                  </Box>

                  <CardContent sx={{ p: 2, bgcolor: "white" }}>
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.95rem",
                        lineHeight: 1.3,
                        minHeight: "2.6em",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {image.name}
                    </Typography>

                    <Box
                      sx={{
                        bgcolor: "#fff3e0",
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 1,
                        border: "1px solid #ffcc02",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        <Box component="span" sx={{ color: "text.secondary" }}>
                          Caption:
                        </Box>{" "}
                        <Box
                          component="span"
                          sx={{ color: "#f57c00", fontWeight: "bold" }}
                        >
                          {image.caption}
                        </Box>
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: "0.75rem", mb: 1.5 }}
                    >
                      Photo by{" "}
                      <Box
                        component="a"
                        href={image.photographer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "primary.main",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {image.photographer}
                      </Box>{" "}
                      on Pexels
                    </Typography>

                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<Download />}
                      onClick={() => {
                        const seoFilename = generateSEOFilename(
                          image.name,
                          index,
                        );
                        downloadImage(image.processed, seoFilename);
                      }}
                      sx={{
                        borderRadius: 1,
                        py: 1,
                        fontSize: "0.8rem",
                        background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #1565c0, #1976d2)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      Download High Quality
                    </Button>
                  </CardContent>
                </Card>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {images.length === 0 && !loading && !error && (
          <Box textAlign="center" sx={{ mt: 8 }}>
            <Paper
              elevation={2}
              sx={{
                maxWidth: 600,
                mx: "auto",
                p: 6,
                borderRadius: 4,
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              }}
            >
              <PhotoCamera
                sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Ready to Create Your Wave Art Empire?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Click "Generate Wave Art" to fetch real ocean images from
                Pexels!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Each image will get SEO-optimized titles and wave captions
                perfect for print-on-demand sales.
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Full-screen Image Modal */}
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedImage(null);
          }}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { bgcolor: "rgba(0, 0, 0, 0.95)" },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "95vw",
              height: "95vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              outline: "none",
              p: 2,
            }}
          >
            {selectedImage && (
              <>
                {/* Close Button */}
                <IconButton
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedImage(null);
                  }}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.9)",
                    },
                    zIndex: 2,
                  }}
                >
                  <Close />
                </IconButton>

                {/* Full-size Image */}
                <Box
                  component="img"
                  src={selectedImage.processed}
                  alt={`${selectedImage.name} - ${selectedImage.caption}`}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "85%",
                    objectFit: "contain",
                    borderRadius: 2,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                    cursor: "zoom-out",
                  }}
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedImage(null);
                  }}
                />

                {/* Image Info */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    p: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "0 0 8px 8px",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", mb: 0.5 }}
                    >
                      {selectedImage.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#ffd54f", mb: 0.5 }}
                    >
                      {selectedImage.caption}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      Photo by {selectedImage.photographer} on Pexels
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => {
                      const seoFilename = generateSEOFilename(
                        selectedImage.name,
                        processedImages.findIndex(
                          (img) => img.id === selectedImage.id,
                        ),
                      );
                      downloadImage(selectedImage.processed, seoFilename);
                    }}
                    sx={{
                      background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #1565c0, #1976d2)",
                      },
                    }}
                  >
                    Download
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default WaveCaptionGenerator;
