// product-preview.js

import { db, storage, ref, uploadBytes, getDownloadURL, collection, addDoc, getDocs, getDoc, query, where, doc, setDoc, serverTimestamp } from './firebase.js';
import { showCheckoutForm } from './cart-login.js?v=20260307a';
import { allProducts as seedProducts } from './products.js?v=20260404a';

const PRODUCT_FALLBACK_IMAGE = "images/roo7z-logo.png";
const THUMB_FALLBACK_IMAGE = "images/roo7z-logo.png";

// Show uncaught errors on page to assist debugging white screen issues
window.addEventListener('error', function(e){
  try {
    console.error('Uncaught error on product-preview page:', e.error || e.message || e);
    const el = document.createElement('div');
    el.style.position = 'fixed'; el.style.left = '12px'; el.style.right = '12px'; el.style.top = '12px'; el.style.zIndex = '999999';
    el.style.background = 'rgba(255,255,255,0.98)'; el.style.color = '#900'; el.style.border = '2px solid #900'; el.style.padding = '12px';
    el.style.fontFamily = 'system-ui, Arial, sans-serif'; el.innerText = 'JavaScript error: ' + (e.message || e.error || e.type || 'Unknown');
    const b = document.createElement('button'); b.textContent = 'Dismiss'; b.style.marginLeft = '12px'; b.onclick = () => el.remove(); el.appendChild(b);
    document.body && document.body.appendChild(el);
  } catch(err){ console.error('Failed to render error box', err); }
});
window.addEventListener('unhandledrejection', function(ev){
  try{
    console.error('Unhandled rejection on product-preview page:', ev.reason);
    const el = document.createElement('div');
    el.style.position = 'fixed'; el.style.left = '12px'; el.style.right = '12px'; el.style.bottom = '12px'; el.style.zIndex = '999999';
    el.style.background = 'rgba(255,255,255,0.98)'; el.style.color = '#900'; el.style.border = '2px solid #900'; el.style.padding = '12px';
    el.style.fontFamily = 'system-ui, Arial, sans-serif';
    el.innerText = 'Unhandled promise rejection: ' + (ev.reason && (ev.reason.message || ev.reason) || ev.reason);
    const b = document.createElement('button'); b.textContent = 'Dismiss'; b.style.marginLeft = '12px'; b.onclick = () => el.remove(); el.appendChild(b);
    document.body && document.body.appendChild(el);
  }catch(err){ console.error('Failed to render rejection box', err); }
});

// ---------------- WAIT UNTIL PRODUCTS ARE LOADED ----------------


// ---------------- MAIN FUNCTION ----------------
async function initPreview() {

  const qs = new URLSearchParams(location.search);
  const id = qs.get("id");
  const category = qs.get("category") || "";

  // DOM refs
  const mainImg = document.getElementById("pp-main-img");
  const mainImageWrap = document.getElementById("pp-main-image");
  const thumbsNode = document.getElementById("pp-thumbs");
  const titleNode = document.getElementById("pp-title");
  const catNode = document.getElementById("pp-category");
  const descNode = document.getElementById("pp-description");
  const priceNode = document.getElementById("pp-price");
  const discountNode = document.getElementById("pp-discount");
  const colorsWrap = document.getElementById("pp-colors");
  const sizesWrap = document.getElementById("pp-sizes");
  const designsWrap = document.getElementById("pp-designs");
  const colorSection = document.getElementById("color-section");
  const sizeSection = document.getElementById("size-section");
  const designSection = document.getElementById("design-section");
  const addBtn = document.getElementById("pp-add");
  const buyNowBtn = document.getElementById("pp-buy-now");
  const relatedNode = document.getElementById("pp-related");
  const stockNode = document.getElementById("pp-stock");
  const fallbackImageUrl = new URL(PRODUCT_FALLBACK_IMAGE, window.location.href).href;
  let activeImageRequestId = 0;
  const getProductsByGroup = () => {
    if (window.allProducts && typeof window.allProducts === "object") return window.allProducts;
    return seedProducts || {};
  };

  const setMainImageLoading = (isLoading) => {
    if (!mainImageWrap) return;
    mainImageWrap.classList.toggle("is-loading", !!isLoading);
  };

  const setMainImageSource = (src) => {
    if (!mainImg) return;
    activeImageRequestId += 1;
    const requestId = activeImageRequestId;
    const targetSrc = src || PRODUCT_FALLBACK_IMAGE;

    setMainImageLoading(true);

    const completeRequest = (finalSrc) => {
      if (requestId !== activeImageRequestId) return;
      mainImg.src = finalSrc;
      setMainImageLoading(false);
    };

    const loadFallback = () => {
      const fallbackProbe = new Image();
      fallbackProbe.onload = () => completeRequest(PRODUCT_FALLBACK_IMAGE);
      fallbackProbe.onerror = () => {
        if (requestId !== activeImageRequestId) return;
        // Never keep loader stuck even if fallback fails.
        mainImg.src = PRODUCT_FALLBACK_IMAGE;
        setMainImageLoading(false);
      };
      fallbackProbe.src = PRODUCT_FALLBACK_IMAGE;
    };

    const probe = new Image();
    probe.onload = () => completeRequest(targetSrc);
    probe.onerror = () => {
      if (targetSrc === fallbackImageUrl || targetSrc === PRODUCT_FALLBACK_IMAGE) {
        completeRequest(PRODUCT_FALLBACK_IMAGE);
        return;
      }
      loadFallback();
    };

    // Safety timeout to avoid infinite spinner in network edge cases.
    setTimeout(() => {
      if (requestId !== activeImageRequestId) return;
      setMainImageLoading(false);
    }, 8000);

    probe.src = targetSrc;
  };

  // Check if essential elements exist
  if (!mainImg || !titleNode || !descNode || !priceNode) {
    console.error("Essential product preview elements not found");
    return;
  }

  const currency = () => localStorage.getItem("roo7z_currency") || "PKR";
  const formatCurrency = (amount) => {
    if (amount == null) amount = 0;
    const cur = currency();
    const locale = cur === "GBP" ? "en-GB" : "en-PK";
    return new Intl.NumberFormat(locale, { style: "currency", currency: cur })
      .format(amount || 0);
  };

  const resolveSwatchColor = (value) => {
    const raw = String(value || "").trim();
    const key = raw.toLowerCase();
    const namedMap = {
      golden: "#d4af37",
      gold: "#d4af37",
      silver: "#c0c0c0"
    };
    return namedMap[key] || raw || "#ddd";
  };

  const getProductCategories = (product) => {
    const raw = [];
    if (Array.isArray(product?.categories)) raw.push(...product.categories);
    if (product?.category) raw.push(product.category);
    return [...new Set(raw.map((v) => String(v || "").trim()).filter(Boolean))];
  };

  async function findProduct() {
    const normalizeTitle = (value) => String(value || "").trim().toLowerCase();
    const getSeedMatch = (candidate = {}) => {
      const seed = getProductsByGroup();
      const pools = Object.values(seed).filter(Array.isArray);
      const allSeedProducts = pools.flat();
      const candidateId = String(candidate.id || "");
      const candidateTitle = normalizeTitle(candidate.title);
      return allSeedProducts.find((item) =>
        String(item?.id || "") === candidateId || normalizeTitle(item?.title) === candidateTitle
      ) || null;
    };

    try {
      const productsByGroup = getProductsByGroup();
      // First try to find in allProducts
      if (category && productsByGroup[category]) {
        const p = productsByGroup[category].find(x => String(x.id) === String(id));
        if (p) return p;
      }
      for (const k of Object.keys(productsByGroup)) {
        const p = productsByGroup[k].find(x => String(x.id) === String(id));
        if (p) return p;
      }

      // If not found, try to fetch from Firestore by document ID
      const productDoc = await getDoc(doc(db, "products", id));
      if (productDoc.exists()) {
        const firestoreProduct = { id: productDoc.id, ...productDoc.data() };
        const seedMatch = getSeedMatch(firestoreProduct);
        // Firestore records may not store full images[]; borrow from seed by title/id.
        return {
          ...(seedMatch || {}),
          ...firestoreProduct,
          images: (Array.isArray(firestoreProduct.images) && firestoreProduct.images.length)
            ? firestoreProduct.images
            : (Array.isArray(seedMatch?.images) ? seedMatch.images : [])
        };
      }
    } catch (error) {
      console.error("Error finding product:", error);
    }
    return null;
  }

  // If no id provided in query string, avoid calling Firestore and show a helpful message
  if (!id) {
    titleNode.textContent = "No product selected";
    descNode.textContent = "Open this page from a product link or provide ?id=PRODUCT_ID in the URL.";
    const grid = document.querySelector(".preview-grid");
    if (grid) grid.style.display = "none";
    return;
  }

  const product = await findProduct();

  if (!product) {
    titleNode.textContent = "Product not found";
    descNode.textContent = "We couldn't find that product.";
    document.querySelector(".preview-grid").style.display = "none";
    return;
  }

  renderProduct(product);
  renderReviews(product);
  renderRelated(product);
  initReviewModal(product);

  // ---------------- RENDER PRODUCT ----------------
  function renderProduct(p) {
    if (titleNode) titleNode.textContent = p.title || "Product";
    if (catNode) {
      const categories = getProductCategories(p);
      catNode.textContent = categories.join(", ") || p.category || "";
    }
    if (descNode) descNode.textContent = p.description || (p.title || "");

    const cur = currency();
    const basePrice =
      cur === "GBP"
        ? (p.priceGBP ?? p.price ?? 0)
        : (p.pricePKR ?? p.price ?? 0);

    const updateDisplayedPrice = (value) => {
      if (!priceNode) return;
      priceNode.textContent = formatCurrency(value);
    };

    updateDisplayedPrice(basePrice);

    if (discountNode) {
      if (p.discount && Number(p.discount) > 0) {
        discountNode.textContent = `${p.discount}% off`;
      } else {
        discountNode.textContent = "";
      }
    }

    const fallbackImage = p.img || p.imageUrl || p.image || "";
    const imgs = Array.isArray(p.images) && p.images.length
      ? p.images
      : (fallbackImage ? [fallbackImage] : []);

    const first = imgs[0] || PRODUCT_FALLBACK_IMAGE;
    const needsTightFit =
      Number(p.id) === 236 || /4\s*qul/i.test(String(p.title || ""));
    mainImageWrap?.classList.toggle("tight-fit", needsTightFit);
    let selectedImageSrc = first;
    let selectedDesignIndex = -1;
    let activeThumbImages = imgs.length ? imgs : [PRODUCT_FALLBACK_IMAGE];

    const renderThumbs = (thumbImages) => {
      if (!thumbsNode) return;
      thumbsNode.innerHTML = "";
      thumbImages.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.dataset.src = src;
        img.onerror = () => img.src = THUMB_FALLBACK_IMAGE;
        img.classList.toggle("active", src === selectedImageSrc);
        img.addEventListener("click", () => {
          setSelectedImage(src);
        });
        thumbsNode.appendChild(img);
      });
    };

    const setSelectedImage = (src) => {
      selectedImageSrc = src || PRODUCT_FALLBACK_IMAGE;
      setMainImageSource(selectedImageSrc);
      if (zoomModal?.classList.contains("open")) {
        syncZoomImage();
      }
      thumbsNode?.querySelectorAll("img").forEach((thumb) => {
        thumb.classList.toggle("active", thumb.dataset.src === selectedImageSrc);
      });
      designsWrap?.querySelectorAll(".design-btn").forEach((btn) => {
        const btnIndex = Number(btn.dataset.index);
        btn.classList.toggle("active", btnIndex === selectedDesignIndex);
      });
    };

    const getActiveImageList = () => (Array.isArray(activeThumbImages) && activeThumbImages.length
      ? activeThumbImages
      : [selectedImageSrc || PRODUCT_FALLBACK_IMAGE]);

    const moveImageBy = (delta) => {
      const list = getActiveImageList();
      if (!list.length) return;
      const currentIndex = Math.max(0, list.findIndex((src) => src === selectedImageSrc));
      const nextIndex = (currentIndex + delta + list.length) % list.length;
      setSelectedImage(list[nextIndex]);
    };

    const ensureZoomModal = () => {
      let modal = document.getElementById("pp-zoom-modal");
      if (modal) return modal;

      modal = document.createElement("div");
      modal.id = "pp-zoom-modal";
      modal.className = "pp-zoom-modal";
      modal.innerHTML = `
        <div class="pp-zoom-toolbar">
          <button type="button" class="pp-zoom-btn" data-zoom-out>-</button>
          <button type="button" class="pp-zoom-btn" data-zoom-in>+</button>
          <button type="button" class="pp-zoom-btn pp-zoom-close" data-zoom-close>Close</button>
        </div>
        <div class="pp-zoom-stage">
          <button type="button" class="pp-nav-btn pp-nav-prev" data-zoom-prev aria-label="Previous image">‹</button>
          <img src="" alt="Zoomed product image" class="pp-zoom-image" id="pp-zoom-image">
          <button type="button" class="pp-nav-btn pp-nav-next" data-zoom-next aria-label="Next image">›</button>
        </div>
      `;
      document.body.appendChild(modal);
      return modal;
    };

    if (mainImageWrap && !mainImageWrap.querySelector(".pp-zoom-trigger")) {
      const zoomTrigger = document.createElement("button");
      zoomTrigger.type = "button";
      zoomTrigger.className = "pp-zoom-trigger";
      zoomTrigger.setAttribute("aria-label", "Zoom image");
      zoomTrigger.textContent = "Zoom";
      mainImageWrap.appendChild(zoomTrigger);
    }

    const zoomModal = ensureZoomModal();
    const zoomImage = zoomModal.querySelector("#pp-zoom-image");
    const zoomInBtn = zoomModal.querySelector("[data-zoom-in]");
    const zoomOutBtn = zoomModal.querySelector("[data-zoom-out]");
    const zoomCloseBtn = zoomModal.querySelector("[data-zoom-close]");
    const zoomPrevBtn = zoomModal.querySelector("[data-zoom-prev]");
    const zoomNextBtn = zoomModal.querySelector("[data-zoom-next]");
    const zoomTriggerBtn = mainImageWrap?.querySelector(".pp-zoom-trigger");

    let zoomScale = 1;
    const applyZoom = () => {
      if (!zoomImage) return;
      zoomImage.style.transform = `scale(${zoomScale})`;
    };

    const syncZoomImage = () => {
      if (!zoomImage) return;
      zoomImage.src = selectedImageSrc || PRODUCT_FALLBACK_IMAGE;
      zoomScale = 1;
      applyZoom();
    };

    const openZoom = () => {
      syncZoomImage();
      zoomModal.classList.add("open");
      document.body.style.overflow = "hidden";
    };

    const closeZoom = () => {
      zoomModal.classList.remove("open");
      document.body.style.overflow = "";
    };

    if (zoomModal && !zoomModal.dataset.bound) {
      zoomModal.dataset.bound = "1";

      zoomInBtn?.addEventListener("click", () => {
        zoomScale = Math.min(4, zoomScale + 0.5);
        applyZoom();
      });

      zoomOutBtn?.addEventListener("click", () => {
        zoomScale = Math.max(1, zoomScale - 0.5);
        applyZoom();
      });

      zoomCloseBtn?.addEventListener("click", closeZoom);
      zoomPrevBtn?.addEventListener("click", () => {
        moveImageBy(-1);
        syncZoomImage();
      });
      zoomNextBtn?.addEventListener("click", () => {
        moveImageBy(1);
        syncZoomImage();
      });

      zoomModal.addEventListener("click", (e) => {
        if (e.target === zoomModal) closeZoom();
      });
    }

    zoomTriggerBtn?.addEventListener("click", openZoom);

    if (mainImageWrap) {
      let touchStartX = 0;
      let touchStartY = 0;

      mainImageWrap.ontouchstart = (e) => {
        const point = e.changedTouches?.[0];
        if (!point) return;
        touchStartX = point.clientX;
        touchStartY = point.clientY;
      };

      mainImageWrap.ontouchend = (e) => {
        const point = e.changedTouches?.[0];
        if (!point) return;
        const dx = point.clientX - touchStartX;
        const dy = point.clientY - touchStartY;
        if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
        moveImageBy(dx < 0 ? 1 : -1);
      };
    }

    if (zoomModal) {
      let zoomTouchStartX = 0;
      let zoomTouchStartY = 0;
      zoomModal.ontouchstart = (e) => {
        if (!zoomModal.classList.contains("open")) return;
        const point = e.changedTouches?.[0];
        if (!point) return;
        zoomTouchStartX = point.clientX;
        zoomTouchStartY = point.clientY;
      };
      zoomModal.ontouchend = (e) => {
        if (!zoomModal.classList.contains("open")) return;
        const point = e.changedTouches?.[0];
        if (!point) return;
        const dx = point.clientX - zoomTouchStartX;
        const dy = point.clientY - zoomTouchStartY;
        if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
        moveImageBy(dx < 0 ? 1 : -1);
        syncZoomImage();
      };
    }

    if (Array.isArray(p.colors) && p.colors.length && colorsWrap && colorSection) {
      colorSection.style.display = "";
      colorsWrap.innerHTML = "";
      p.colors.forEach((c, idx) => {
        const node = document.createElement("button");
        node.type = "button";
        node.className = "swatch";
        node.style.background = resolveSwatchColor(c);
        node.title = String(c || "");
        node.setAttribute("aria-label", `Color ${c}`);
        node.dataset.color = c;
        if (idx === 0) node.classList.add("selected");
        node.addEventListener("click", () => {
          colorsWrap.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
          node.classList.add("selected");
        });
        colorsWrap.appendChild(node);
      });
    } else if (colorSection) {
      colorSection.style.display = "none";
    }

    const setOptions = Array.isArray(p.sets || p.setof)
      ? (p.sets || p.setof)
          .map((s) => {
            if (s && typeof s === "object") {
              const label = String(s.label || s.name || s.set || "").trim();
              if (!label) return null;
              return { label, pricePKR: s.pricePKR, priceGBP: s.priceGBP };
            }
            const label = String(s || "").trim();
            return label ? { label } : null;
          })
          .filter(Boolean)
      : [];
    const hasSetOptions = setOptions.length > 0;

    const getSelectedSetPrice = () => {
      const selectedDesignBtn = designsWrap?.querySelector(".design-btn.active");
      if (!selectedDesignBtn) return null;
      const priceFromSet =
        cur === "GBP"
          ? Number(selectedDesignBtn.dataset.pricegbp)
          : Number(selectedDesignBtn.dataset.pricepkr);
      return Number.isFinite(priceFromSet) ? priceFromSet : null;
    };

    const sizeOptions = Array.isArray(p.sizes)
      ? p.sizes
          .map((s) => {
            if (s && typeof s === "object") {
              const label = String(s.label || s.name || s.size || "").trim();
              if (!label) return null;
              return { label, pricePKR: s.pricePKR, priceGBP: s.priceGBP };
            }
            const label = String(s || "").trim();
            return label ? { label } : null;
          })
          .filter(Boolean)
      : [];

    if (sizeOptions.length && sizesWrap && sizeSection) {
      sizeSection.style.display = "";
      sizesWrap.innerHTML = "";
      sizeOptions.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "size-btn";
        btn.textContent = opt.label;
        if (opt.pricePKR != null) btn.dataset.pricepkr = String(opt.pricePKR);
        if (opt.priceGBP != null) btn.dataset.pricegbp = String(opt.priceGBP);
        btn.addEventListener("click", () => {
          sizesWrap.querySelectorAll(".size-btn").forEach(x => x.classList.remove("active"));
          btn.classList.add("active");
          const priceFromSize =
            cur === "GBP"
              ? Number(btn.dataset.pricegbp)
              : Number(btn.dataset.pricepkr);
          if (Number.isFinite(priceFromSize)) {
            updateDisplayedPrice(priceFromSize);
            return;
          }
          const priceFromSet = getSelectedSetPrice();
          updateDisplayedPrice(Number.isFinite(priceFromSet) ? priceFromSet : basePrice);
        });
        sizesWrap.appendChild(btn);
      });
    } else if (sizeSection) {
      sizeSection.style.display = "none";
    }

    const designLabel = designSection?.querySelector(".option-label");
    if (designLabel) {
      designLabel.textContent = hasSetOptions ? "Set" : "Design";
    }

    const declaredDesigns = Array.isArray(p.designs) ? p.designs : [];
    const designOptions = declaredDesigns.length
      ? declaredDesigns
          .map((item, idx) => {
            const designImages = Array.isArray(item?.images)
              ? item.images.filter(Boolean)
              : [item?.src || item?.image || item?.img].filter(Boolean);
            return {
              label: String(item?.label || item?.name || `Design ${idx + 1}`),
              images: designImages
            };
          })
          .filter((item) => item.images.length)
      : imgs.map((src, idx) => ({ label: `Design ${idx + 1}`, images: [src] }));

    if (designSection && designsWrap && hasSetOptions) {
      designSection.style.display = "";
      designsWrap.innerHTML = "";
      setOptions.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "design-btn";
        btn.textContent = opt.label;
        if (opt.pricePKR != null) btn.dataset.pricepkr = String(opt.pricePKR);
        if (opt.priceGBP != null) btn.dataset.pricegbp = String(opt.priceGBP);
        if (idx === 0) btn.classList.add("active");
        btn.addEventListener("click", () => {
          designsWrap.querySelectorAll(".design-btn").forEach(x => x.classList.remove("active"));
          btn.classList.add("active");
          const priceFromSet =
            cur === "GBP"
              ? Number(btn.dataset.pricegbp)
              : Number(btn.dataset.pricepkr);
          updateDisplayedPrice(Number.isFinite(priceFromSet) ? priceFromSet : basePrice);
        });
        designsWrap.appendChild(btn);
      });

      const firstSetPrice = getSelectedSetPrice();
      if (Number.isFinite(firstSetPrice)) {
        updateDisplayedPrice(firstSetPrice);
      }
      renderThumbs(activeThumbImages);
      setSelectedImage(first);
    } else if (designSection && designsWrap && declaredDesigns.length > 0 && designOptions.length > 0) {
      designSection.style.display = "";
      designsWrap.innerHTML = "";

      designOptions.forEach((design, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "design-btn";
        btn.textContent = design.label || `Design ${idx + 1}`;
        btn.dataset.index = String(idx);
        if (idx === 0) btn.classList.add("active");
        btn.addEventListener("click", () => {
          selectedDesignIndex = idx;
          activeThumbImages = design.images;
          renderThumbs(activeThumbImages);
          setSelectedImage(activeThumbImages[0] || PRODUCT_FALLBACK_IMAGE);
        });
        designsWrap.appendChild(btn);
      });

      selectedDesignIndex = 0;
      activeThumbImages = designOptions[0].images;
      renderThumbs(activeThumbImages);
      setSelectedImage(activeThumbImages[0] || PRODUCT_FALLBACK_IMAGE);
    } else if (designSection) {
      designSection.style.display = "none";
      renderThumbs(activeThumbImages);
      setSelectedImage(first);
    }

    const rawStock = p?.stock;
    const hasExplicitStock = rawStock !== undefined && rawStock !== null && String(rawStock).trim() !== "";
    const stockCount = Number(rawStock);
    const isSoldOut = hasExplicitStock && (!Number.isFinite(stockCount) || stockCount <= 0);

    if (stockNode) {
      if (!hasExplicitStock) {
        stockNode.textContent = "In stock";
      } else {
        stockNode.textContent = Number.isFinite(stockCount) && stockCount > 0 ? "In stock" : "Out of stock";
      }
    }

    const addToCart = () => {
      if (isSoldOut) {
        return null;
      }
      const selectedColor = colorsWrap?.querySelector(".swatch.selected")?.dataset.color || null;
      const selectedSizeButton = sizesWrap?.querySelector(".size-btn.active");
      const selectedDesignButton = designsWrap?.querySelector(".design-btn.active");
      const selectedSize = selectedSizeButton?.textContent || null;
      const selectedDesign = designsWrap?.querySelector(".design-btn.active")?.textContent || null;
      const hasSizeOptions = sizeOptions.length > 0;

      if (hasSizeOptions && !selectedSize) {
        alert("Please select a size.");
        return null;
      }

      if (hasSetOptions && !selectedDesign) {
        alert("Please select a set.");
        return null;
      }

      const sizePricePKR = Number(selectedSizeButton?.dataset.pricepkr);
      const sizePriceGBP = Number(selectedSizeButton?.dataset.pricegbp);
      const designPricePKR = Number(selectedDesignButton?.dataset.pricepkr);
      const designPriceGBP = Number(selectedDesignButton?.dataset.pricegbp);
      const resolvedPricePKR = Number.isFinite(designPricePKR)
        ? designPricePKR
        : (Number.isFinite(sizePricePKR) ? sizePricePKR : Number(p.pricePKR ?? p.price ?? 0));
      const resolvedPriceGBP = Number.isFinite(designPriceGBP)
        ? designPriceGBP
        : (Number.isFinite(sizePriceGBP) ? sizePriceGBP : Number(p.priceGBP ?? p.price ?? 0));

      const cartItem = {
        id: p.id,
        title: p.title,
        img: selectedImageSrc || imgs[0] || "",
        qty: 1,
        pricePKR: resolvedPricePKR,
        priceGBP: resolvedPriceGBP,
        color: selectedColor,
        size: selectedSize,
        design: selectedDesign
      };

      const evt = new CustomEvent("universal-add-to-cart", { detail: cartItem });
      document.dispatchEvent(evt);

      return cartItem;
    };

    if (addBtn) {
      if (isSoldOut) {
        addBtn.disabled = true;
        addBtn.setAttribute("aria-disabled", "true");
        addBtn.textContent = "Sold Out";
      } else {
        addBtn.onclick = () => {
          const addedItem = addToCart();
          if (!addedItem) return;
          addBtn.textContent = "Added ✓";
          setTimeout(() => addBtn.textContent = "Add to cart", 1200);
        };
      }
    }

    if (buyNowBtn) {
      if (isSoldOut) {
        buyNowBtn.disabled = true;
        buyNowBtn.setAttribute("aria-disabled", "true");
      } else {
        buyNowBtn.onclick = () => {
          console.log("Buy Now button clicked");
          const addedItem = addToCart();
          if (!addedItem) return;
          // Small delay to ensure cart is updated
          setTimeout(() => {
            console.log("Calling showCheckoutForm");
            showCheckoutForm();
          }, 100);
        };
      }
    }


  }

  // ---------------- REVIEWS ----------------
async function renderReviews(p) {
  const reviewsNode = document.getElementById("pp-reviews");
  if (!reviewsNode) return;
  reviewsNode.innerHTML = "<p>Loading reviews...</p>";
  const escapeReviewHtml = (value) =>
    String(value || "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const escapeAttr = (value) => escapeReviewHtml(value);
  const formatReviewDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    try {
      if (typeof timestamp?.toDate === "function") {
        return timestamp.toDate().toLocaleDateString();
      }
      const date = new Date(timestamp);
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString();
    } catch (error) {
      console.warn("Invalid review timestamp:", error);
    }
    return "Unknown date";
  };
  const resolveReviewImageUrl = (review) => {
    const candidates = [
      review?.imageUrl,
      review?.reviewImageUrl,
      review?.image,
      review?.photoUrl,
      review?.photoURL
    ];
    return candidates.find((value) => typeof value === "string" && value.trim()) || "";
  };

  try {
    // Fetch reviews from Firebase
    const q = query(collection(db, "reviews"), where("productId", "==", String(p.id)));
    const querySnapshot = await getDocs(q);

    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    // Sort reviews by timestamp (newest first)
    reviews.sort((a, b) => {
      const aTime = typeof a?.timestamp?.toDate === "function" ? a.timestamp.toDate().getTime() : 0;
      const bTime = typeof b?.timestamp?.toDate === "function" ? b.timestamp.toDate().getTime() : 0;
      return bTime - aTime;
    });

    reviewsNode.innerHTML = "";

    if (reviews.length === 0) {
      reviewsNode.innerHTML = "<p>No reviews yet. Be the first to write one!</p>";
      return;
    }

    reviews.forEach(review => {
      const div = document.createElement("div");
      div.className = "review-item";
      const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      const date = formatReviewDate(review.timestamp);
      const reviewImage = resolveReviewImageUrl(review);
      const imageBlock = reviewImage
        ? `<img src="${escapeAttr(reviewImage)}" alt="Review image by ${escapeReviewHtml(review.name)}" class="review-image" loading="lazy" referrerpolicy="no-referrer">`
        : "";
      div.innerHTML = `
        <div class="review-header">
          <span class="review-name">${escapeReviewHtml(review.name)}</span>
          <span class="review-rating">${stars}</span>
          <span class="review-date">${date}</span>
        </div>
        <p class="review-text">${escapeReviewHtml(review.text)}</p>
        ${imageBlock}
      `;
      reviewsNode.appendChild(div);
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    reviewsNode.innerHTML = "<p>Failed to load reviews. Please try again later.</p>";
  }
}

  // ---------------- RELATED PRODUCTS ----------------
function renderRelated(p) {
  if (!relatedNode) return;
  relatedNode.innerHTML = "";
  const productsByGroup = getProductsByGroup();

  // Get products from the same category excluding the current one
  const currentCategories = getProductCategories(p).map((value) => value.toLowerCase());
  let pool = Object.values(productsByGroup).flat().filter(item => {
    if (!item || String(item.id) === String(p.id)) return false;
    const itemCategories = getProductCategories(item).map((value) => value.toLowerCase());
    return itemCategories.some((cat) => currentCategories.includes(cat));
  });

  if (!pool || pool.length === 0) {
    relatedNode.innerHTML = "<p>No related products</p>";
    return;
  }

  // Randomly select up to 4 related items
  let related = pool.sort(() => 0.5 - Math.random()).slice(0, 4);

  // Step 4: Render related items
  if (related.length === 0) {
    relatedNode.innerHTML = "<p>No related products</p>";
    return;
  }

  related.forEach(item => {
    if (!item) return;
    const div = document.createElement("div");
    div.className = "related-item";
    const imgSrc = item.img || item.imageUrl || item.image || item.images?.[0] || PRODUCT_FALLBACK_IMAGE;
    div.innerHTML = `
      <img src="${imgSrc}" alt="${item.title || 'Product'}" style="cursor:pointer">
      <div class="title">${item.title || 'Product'}</div>
    `;
    div.addEventListener("click", () => {
      const params = new URLSearchParams();
      params.set("id", item.id);
      // Find the category for the related item
      let pageGroup = "";
      for (let group in productsByGroup) {
        if (productsByGroup[group] && productsByGroup[group].some(it => String(it.id) === String(item.id))) {
          pageGroup = group;
          break;
        }
      }
      if (pageGroup) params.set("category", pageGroup);
      window.location.href = `product-preview.html?${params.toString()}`;
    });

    relatedNode.appendChild(div);
  });
}

// ---------------- REVIEW MODAL ----------------
function initReviewModal(p) {
  const addReviewBtn = document.getElementById("add-review-btn");
  const reviewModal = document.getElementById("review-modal");
  const closeModalBtn = document.getElementById("close-review-modal");
  const reviewForm = document.getElementById("review-form");
  const reviewImageInput = document.getElementById("review-image");

  // Check if all required elements exist before adding event listeners
  if (!addReviewBtn || !reviewModal || !closeModalBtn || !reviewForm) {
    console.warn("Review modal elements not found, skipping review modal initialization");
    return;
  }

  // Open modal
  addReviewBtn.addEventListener("click", () => {
    reviewModal.style.display = "flex";
  });

  // Close modal
  closeModalBtn.addEventListener("click", () => {
    reviewModal.style.display = "none";
    reviewForm.reset();
    if (reviewImageInput) reviewImageInput.value = "";
  });

  // Close modal when clicking outside
  reviewModal.addEventListener("click", (e) => {
    if (e.target === reviewModal) {
      reviewModal.style.display = "none";
      reviewForm.reset();
      if (reviewImageInput) reviewImageInput.value = "";
    }
  });

  // Handle form submission
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const name = document.getElementById("review-name").value.trim();
    const text = document.getElementById("review-text").value.trim();
    const imageFile = reviewImageInput?.files?.[0] || null;

    if (!rating || !name || !text) {
      alert("Please fill in all fields.");
      return;
    }

    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB.");
        return;
      }
    }

    try {
      let reviewImageUrl = null;
      if (imageFile) {
        const safeFileName = String(imageFile.name || "review-image")
          .replace(/[^\w.-]+/g, "_")
          .slice(-120);
        const storagePath = `reviews/${String(p.id)}/${Date.now()}_${safeFileName}`;
        const reviewImageRef = ref(storage, storagePath);
        await uploadBytes(reviewImageRef, imageFile);
        reviewImageUrl = await getDownloadURL(reviewImageRef);
      }

      // Add review to Firebase
      await addDoc(collection(db, "reviews"), {
        productId: String(p.id),
        name: name,
        rating: parseInt(rating),
        text: text,
        imageUrl: reviewImageUrl,
        reviewImageUrl: reviewImageUrl,
        timestamp: serverTimestamp()
      });

      // Close modal and reset form
      reviewModal.style.display = "none";
      reviewForm.reset();
      if (reviewImageInput) reviewImageInput.value = "";

      // Refresh reviews
      renderReviews(p);

      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to submit review. Please try again.");
    }
  });
}

}

// Debug function to check checkout elements
function debugCheckoutElements() {
  console.log('=== Checkout Debug ===');
  console.log('Checkout overlay:', document.getElementById('checkout-overlay'));
  console.log('Checkout form:', document.getElementById('checkout-form'));
  console.log('Checkout button:', document.getElementById('univ-checkout'));
  console.log('Cart sidebar:', document.getElementById('univ-cart-sidebar'));
}

// Add fallback checkout button handler
function addCheckoutButtonHandler() {
  const checkoutBtn = document.getElementById('univ-checkout');
  if (checkoutBtn) {
    console.log('Adding checkout button handler');
    checkoutBtn.addEventListener('click', (e) => {
      console.log('Checkout button clicked from product-preview');
      e.preventDefault();
      e.stopPropagation();
      showCheckoutForm();
    });
  } else {
    console.error('Checkout button not found in product-preview');
  }

  // Add test checkout button handler
  const testCheckoutBtn = document.getElementById('test-checkout');
  if (testCheckoutBtn) {
    testCheckoutBtn.addEventListener('click', (e) => {
      console.log('Test checkout button clicked');
      e.preventDefault();
      // Force show checkout overlay
      const overlay = document.getElementById('checkout-overlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        overlay.classList.add('show');
        console.log('Checkout overlay forced to show');
      } else {
        console.error('Checkout overlay not found');
        alert('Checkout form not found!');
      }
    });
  }
}

// Initialize when DOM is ready and products are loaded
function initializePreview() {
  initPreview();
  setTimeout(() => {
    debugCheckoutElements();
    addCheckoutButtonHandler();
  }, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePreview);
} else {
  initializePreview();
}
