import { useState, useCallback } from 'react';
import { generateSEOOptimizedCopy } from '../utils/seoOptimizedCopy.js';
import { listingTracker } from '../services/listingTracker.js';

export const useListingManagement = () => {
  // Listing management state
  const [creatingListings, setCreatingListings] = useState(false);
  const [createdProducts, setCreatedProducts] = useState([]);
  const [listingProgress, setListingProgress] = useState(0);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');

  // Create Printify listings from approved images
  const createPrintifyListings = useCallback(async (approvedImages) => {
    if (!approvedImages || approvedImages.length === 0) {
      console.warn('No approved images to create listings for');
      return;
    }

    setCreatingListings(true);
    setListingProgress(0);
    setCreatedProducts([]);

    const newProducts = [];
    
    for (let i = 0; i < approvedImages.length; i++) {
      const image = approvedImages[i];
      setListingProgress(i + 1);
      
      try {
        console.log(`📦 Creating listing ${i + 1}/${approvedImages.length} for image: ${image.id}`);
        
        // Generate SEO-optimized copy
        const seoOptimizedCopy = generateSEOOptimizedCopy(
          image.caption,
          image.metadata?.context || 'office',
          'therapeutic'
        );
        
        // Create filename
        const cleanCaption = image.caption
          .split('[').join('').split(']').join('')
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 40);
        const filename = `${cleanCaption}-${image.metadata?.context || 'office'}-wall-art-${Date.now()}`;
        
        // Upload image to Printify
        console.log('📤 Uploading image to Printify...');
        const uploadResponse = await fetch('http://localhost:3001/api/printify/upload-image-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: image.processed,
            filename: filename
          })
        });

        if (!uploadResponse.ok) {
          throw new Error(`Image upload failed: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('✅ Image uploaded successfully:', uploadResult.id);

        // Create product data
        const productData = {
          title: seoOptimizedCopy.title,
          description: seoOptimizedCopy.description,
          blueprint_id: 97, // Satin Posters
          print_provider_id: 99, // Printify Choice
          variants: [
            {
              id: 33742, // 14″ x 11″
              price: Math.round(seoOptimizedCopy.pricing.base * 100), // Convert to cents
              is_enabled: true
            }
          ],
          print_areas: [
            {
              variant_ids: [33742],
              placeholders: [
                {
                  position: "front",
                  images: [
                    {
                      id: uploadResult.id,
                      x: 0.5,
                      y: 0.5,
                      scale: 1,
                      angle: 0
                    }
                  ]
                }
              ]
            }
          ],
          tags: seoOptimizedCopy.tags
        };

        // Create product on Printify
        console.log('🏭 Creating product on Printify...');
        const productResponse = await fetch('http://localhost:3001/api/printify/create-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });

        if (!productResponse.ok) {
          throw new Error(`Product creation failed: ${productResponse.status}`);
        }

        const product = await productResponse.json();
        console.log('✅ Product created successfully:', product.id);

        // Create listing record for tracking
        const listing = {
          listingId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: 'manual',
          productId: product.id,
          imageData: image,
          productCopy: seoOptimizedCopy,
          printifyProduct: product,
          success: true,
          completedTime: Date.now(),
          steps: {
            generating_image: 'completed',
            creating_copy: 'completed',
            creating_product: 'completed',
            publishing_shopify: product.published ? 'completed' : 'warning'
          }
        };

        // Record in persistent tracker
        listingTracker.recordListing(listing);

        // Add to created products
        newProducts.push({
          ...product,
          originalImage: image,
          seoOptimizedCopy,
          listing
        });

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Failed to create listing for image ${image.id}:`, error);
        
        // Record failed listing
        const failedListing = {
          listingId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: 'manual',
          imageData: image,
          error: error.message,
          success: false,
          steps: {
            generating_image: 'completed',
            creating_copy: 'error',
            creating_product: 'error',
            publishing_shopify: 'error'
          }
        };

        listingTracker.recordListing(failedListing);
      }
    }

    setCreatedProducts(newProducts);
    setCreatingListings(false);
    
    console.log(`✅ Listing creation complete: ${newProducts.length}/${approvedImages.length} successful`);
    
    return newProducts;
  }, []);

  // Delete product from Printify
  const handleProductDelete = useCallback(async (productId) => {
    try {
      console.log(`🗑️ Deleting product: ${productId}`);
      
      const response = await fetch(`http://localhost:3001/api/printify/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      // Remove from local state
      setCreatedProducts(prev => prev.filter(p => p.id !== productId));
      
      console.log('✅ Product deleted successfully');
      
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
    }
  }, []);

  // Bulk delete all products
  const handleBulkDelete = useCallback(async () => {
    if (confirmPhrase !== 'DELETE ALL LISTINGS') {
      console.warn('Invalid confirmation phrase');
      return;
    }

    setBulkDeleteLoading(true);

    try {
      const productIds = createdProducts.map(p => p.id);
      
      const response = await fetch('http://localhost:3001/api/printify/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds,
          confirmPhrase
        })
      });

      if (!response.ok) {
        throw new Error(`Bulk delete failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Bulk delete completed:', result);

      // Clear local state
      setCreatedProducts([]);
      setBulkDeleteDialog(false);
      setConfirmPhrase('');
      
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
    } finally {
      setBulkDeleteLoading(false);
    }
  }, [createdProducts, confirmPhrase]);

  // Refresh products list
  const handleRefreshProducts = useCallback(async () => {
    try {
      console.log('🔄 Refreshing products list...');
      
      const response = await fetch('http://localhost:3001/api/printify/products');
      
      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const products = await response.json();
      
      // Filter and update only session products
      const sessionProducts = products.data?.filter(p => 
        createdProducts.some(cp => cp.id === p.id)
      ) || [];
      
      setCreatedProducts(prev => prev.map(cp => {
        const updated = sessionProducts.find(sp => sp.id === cp.id);
        return updated ? { ...cp, ...updated } : cp;
      }));
      
      console.log('✅ Products refreshed');
      
    } catch (error) {
      console.error('❌ Failed to refresh products:', error);
    }
  }, [createdProducts]);

  // Publish individual product
  const handleProductPublish = useCallback(async (productId) => {
    try {
      console.log(`📢 Publishing product: ${productId}`);
      
      const response = await fetch(`http://localhost:3001/api/printify/publish-product/${productId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Publish failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Update local state
      setCreatedProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, published: result.published } : p
      ));
      
      console.log('✅ Product published successfully');
      
    } catch (error) {
      console.error('❌ Failed to publish product:', error);
    }
  }, []);

  // Bulk publish all draft products
  const handleBulkPublish = useCallback(async () => {
    const draftProducts = createdProducts.filter(p => !p.published);
    
    console.log(`📢 Bulk publishing ${draftProducts.length} products...`);
    
    for (const product of draftProducts) {
      try {
        await handleProductPublish(product.id);
        // Small delay between publishes
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to publish product ${product.id}:`, error);
      }
    }
    
    console.log('✅ Bulk publish completed');
  }, [createdProducts, handleProductPublish]);

  return {
    // State
    creatingListings,
    setCreatingListings,
    createdProducts,
    setCreatedProducts,
    listingProgress,
    setListingProgress,
    bulkDeleteDialog,
    setBulkDeleteDialog,
    bulkDeleteLoading,
    setBulkDeleteLoading,
    confirmPhrase,
    setConfirmPhrase,
    
    // Actions
    createPrintifyListings,
    handleProductDelete,
    handleBulkDelete,
    handleRefreshProducts,
    handleProductPublish,
    handleBulkPublish
  };
};