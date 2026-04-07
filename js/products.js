// products.js
export const allProducts = {
    jewelery: [

        { id: 201, title: "STAINLESS HEART PENDENT", pricePKR: 699, priceGBP: 22.99, discount: 5, img: "images/Pendants/p-8.jpeg", "images": [
        "images/Pendants/p-8.jpeg","images/Pendants/p-8.1.jpeg"] ,category: "pendants", description: "Elegent stainless pendant featuring a heart with white stone.Perfect for everyday styling or as a thoughtful gift." },
       
  
        { id: 202, title: "Silver Eternal Heart", pricePKR: 399, priceGBP: 19.99, img:"images/rings/r-1.jpeg", "images": [
        "images/rings/r-1.jpeg","images/rings/r-1.2.jpeg","images/rings/r-1.1.jpeg"],category: "rings", description: "when stenght meets sophistication." },

        { id: 203, title: "GOLDEN HAMMERED CUFF", pricePKR: 699, priceGBP: 15, discount: 5, img: "images/bracelets/b-1.jpeg", "images": ["images/bracelets/b-1.jpeg","images/bracelets/b-1.1.jpeg"],
        category: "bracelets", description: "A PREMIUM HAMMERED - FINISH GOLD CUFF THAT REFLECTS TIMELESS ELEGANCE AND MODERN LUXURY." },

        { id: 204, title: "STAINLESS Pendant", pricePKR: 550, priceGBP: 7, discount: 20, img:"images/Pendants/id-4.jpeg", "images": ["images/Pendants/id-4.jpeg","images/Pendants/id-4.1.jpeg","images/Pendants/id-4.2.jfif"], 
            category: "pendants", description: "Who wouldn’t want this!🤩🤯✨__Elevate your look with durability and style with @roo7z."},

        { id: 205, title: "NOOR-E-NAZAR Stainless Necklace", pricePKR: 899, priceGBP: 25.99, discount: 5, img:"images/Pendants/noor-e-nazar.jpeg", "images": ["images/Pendants/noor-e-nazar.jpeg","images/Pendants/noor-e-nazar1.jpeg"]
            ,category: "pendants", description: "Elegant and timeless, the Noor-e-Nazar Necklace is crafted from premium stainless steel for lasting shine and durability. Its sleek, minimalist design adds a subtle glow to any outfit, making it perfect for both everyday wear and special occasions. Lightweight, skin-friendly, and versatile — a must-have piece for effortless style." },

        { id: 206, title: "Shahi Virasat Oxidised Jhumka", pricePKR: 1200, priceGBP: 29.99, discount: 7, img: "images/earring/jhumka-1.jpg","images": ["images/earring/jhumka-1.jpg","images/earring/jhumka-1.1.jpg"], category: "oxidize",
             description: "Channel timeless grace with our Antique Heritage Jhumkas. These exquisite earrings showcase the beauty of traditional Indian craftsmanship, featuring an intricate floral-motif stud and a majestic cylindrical bell. Handcrafted with an oxidised silver finish,these jhumkas offer a vintage, rustic charm that never goes out of style.The bottom of each jhumki is finished with delicate silver droplets that add a soft, melodic chime to your every movement." },
        
        { id: 207, title: "EARRING", pricePKR: 350, priceGBP: 19.99, discount: 0, stock: 0, img: "images/earring/elephant-earring.jpg", "images": ["images/earring/elephant-earring.jpg","images/earring/elephant-earring1.1.jpg"],category: "Earrings",
             description: "Add a touch of whimsical charm and ethnic grace to your look with our Gaja Heritage Elephant Earrings. These beautiful drop earrings feature a finely detailed elephant motif, a symbol of strength and wisdom, crafted with an oxidised silver finish. The antique textures and intricate engravings on the elephant’s saddle provide a vintage bohemian vibe that stands out.Lightweight and comfortable, these earrings are designed for the modern woman who loves to carry a piece of heritage with her." },
        
        { id: 208, title: "Chic Pendant", pricePKR: 450, priceGBP: 9.99, discount: 0, img: "images/Pendants/id-8.jfif", "images": ["images/Pendants/id-8.jfif","images/Pendants/id-8.1.jpeg"],category: "pendants", description: "The perfect blend of simple and chic. This Golden Heart Necklace is designed to sit beautifully on the collarbone, making it the ultimate accessory for both casual tees and evening dresses. Lightweight, durable, and finished with a high-shine polish, it’s the piece your collection has been missing." },
        
        
        { id: 209, title: "The Royal Emerald", pricePKR: 550, priceGBP: 18.99, discount: 5, img: "images/rings/r-2.jpeg",  "images": ["images/rings/r-2.jpeg","images/rings/r-2.1.png"],category: "rings", 
            description: "Regal Aesthetic: A bold emerald-green center stone that commands attention.Pre-Stacked Style: Three integrated bands that create a full, layered look without the hassle of multiple rings.Craftsmanship:Precision-cut rectangular stone paired with clear brilliant-cut accents.Beautifully complements every look for maximum impact." },
        
        { id: 210, title: "Triple-Layer Bracelet", pricePKR: 799, priceGBP: 7, discount: 6, img: "images/bracelets/b-6.jfif", "images": ["images/bracelets/b-6.jfif","images/bracelets/b-6.2.jfif","images/bracelets/b-6.1.jfif"], category: "bracelets", 
            description: "Premium Stainless Steel: Crafted from durable, water-resistant, and tarnish-proof stainless steel—ideal for daily wear. Pre-Stacked Look: A single bangle that creates the illusion of three perfectly layered bracelets. Exquisite Emerald Center: Features a vibrant, rectangular green stone that serves as a sophisticated focal point. Brilliant Crystal Detailing: Precision-cut micro-crystals that provide a continuous sparkle from every angle. Hypoallergenic & Comfortable: Gentle on the skin with a smooth interior finish and a secure, easy-to-use clasp.." },
        
        { id: 211, title: "ROYAL HAMMERED MEDALLION CUFF", pricePKR: 799, priceGBP: 19.99, discount: 3, img: "images/bracelets/b-4.jpeg", "images": ["images/bracelets/b-4.jpeg","images/bracelets/b-4.1.jpeg"],category:"bracelets", 
            description: "A bold golden stainless cuff featuring textured medallion panels that create a powerful,luxurious statement with timeless appeal." },
       
        { id: 212, title: "silver leaf Ring", pricePKR: 350, priceGBP: 9.99, discount: 0, img: "images/rings/r-4.2.jpeg","images": ["images/rings/r-4.2.jpeg","images/rings/r-4.1.jpeg","images/rings/r-4.jpeg"], category: "rings", 
            description: "silver stainless steel ring." },
       
        { id: 213, title: "Royal Pearl-Laden Heritage Chandbalis", pricePKR: 1650, priceGBP: 34.99, discount: 0, img: "images/earring/e-1.png", "images": ["images/earring/e-1.png","images/earring/e-1.1.png","images/earring/e-1.2.jpeg"],category: "oxidize",
             description: "Step into the spotlight with our Royal Pearl-Laden Heritage Chandbalis. These breathtaking statement earrings are a tribute to grand ethnic craftsmanship. The design features a majestic heart-shaped filigree stud with traditional peacock or floral engravings, finished in a rich antique gold tone." },
        
        { id: 214, title: "rings", pricePKR: 550, priceGBP: 19.99, img: "images/rings/r-3.jpeg", "images": ["images/rings/r-3.jpeg","images/rings/r-3.1.png"],category: "rings", description: "Premium gold plated jewelry." },
        
        { id: 215, title: "Timeless Bow Pendant", pricePKR: 449, priceGBP: 22.99, discount: 4, img: "images/Pendants/p-9.1.jfif", "images": ["images/Pendants/p-9.1.jfif","images/Pendants/p-9.jfif","images/Pendants/p-9.2.jfif"],category: "pendants", description: "Add a touch of feminine charm to your everyday style with our Timeless Bow Pendant. Inspired by the timeless elegance of a perfectly tied ribbon, this pendant is crafted with exquisite detail to capture a soft, fluid silhouette. Whether you're dressing up for a brunch date or adding a coquette touch to your office attire, this piece is the ultimate symbol of dainty sophistication." },
        
        { id: 216, title: "GRACE OXIDISE HANDCUFF", pricePKR: 799, priceGBP: 26, discount: 9, img: "images/bracelets/b-7.jpeg","images": ["images/bracelets/b-7.jpeg","images/bracelets/b-7.1.jpeg"], category: "oxidize", description: "Make a bold yet elegant statement with this intricately crafted antique cuff bracelet. Designed with delicate filigree patterns and charming dangling accents, it captures the essence of vintage beauty while elevating any modern look. Perfect for festive occasions or refined everyday styling, this piece wraps your wrist in sophistication and effortless charm." },
       
        { id: 217, title: "EARrings", pricePKR: 450, priceGBP: 16.99, discount: 0, img: "images/earring/e-9.jpeg", "images": ["images/earring/e-9.jpeg","images/earring/e-9.1.jpeg"],category: "Earrings", description: "Elegant rings." },
        
        { id: 218, title: "CLASSIC HAMMERED DISC CUFF", pricePKR: 799, priceGBP: 19.99, discount: 7, img: "images/bracelets/b-3.jpeg", "images": ["images/bracelets/b-3.jpeg","images/bracelets/b-3.1.png","images/bracelets/b-3.2.png"],category: "bracelets", description: "An elegent hammered golden stainless steel cuff with smooth disc detailing, designed to reflect understated sophistication and modern charm." },
       
        { id: 219, title: "Royal Azure", pricePKR: 999, priceGBP: 24.99, discount: 5, img: "images/rings/r5.jpeg", "images": ["images/rings/r5.jpeg","images/rings/r5.1.jpeg"],category: "rings", 
            description: "Beautiful ring collection." },

        { id: 220, title: "silver bird oxidise jhumka ", pricePKR: 999, priceGBP: 24.99, discount: 0, img: "images/earring/e-7.jpeg", "images": ["images/earring/e-7.jpeg","images/earring/e-7.1.jpeg"], category: "oxidize", 
            description: "“Some jewelry doesn’t just shine… it tells a story.Handcrafted, timeless, and made to elevate every look.This is elegance you can feel.”." },

        { id: 221, title: "long necklace with earrings, jewellery set ", pricePKR: 2499, priceGBP: 34.99, discount: 4, img: "images/Pendants/e-8.jpeg", "images": ["images/Pendants/e-8.jpeg","images/Pendants/e-8.1.jpeg","images/Pendants/e-8.2.jpeg"],category:"oxidize", description: "Stylish necklace." },
        
        { id: 222, title: "Stainless Beauty ", pricePKR: 499, priceGBP: 14.99, discount: 0, img: "images/earring/e-8.jpeg",  "images": ["images/earring/e-8.jpeg","images/earring/e-8.1.png"],category: "Earrings", description: "Premium earring." },
        { id: 223, title: "earring ", pricePKR: 350, priceGBP: 9.99, discount: 3, img: "images/earring/e-6.jpeg", "images": ["images/earring/e-6.jpeg","images/earring/e-6.1.jpeg"],category: "Earrings", description: "Designer rings." },
         
        { id: 224, title: "cute bow Studs ", pricePKR: 450, priceGBP: 14.99, discount: 0, img: "images/earring/e-3.jpeg",  "images": ["images/earring/e-3.jpeg","images/earring/e-3.1.jpg","images/earring/e-3.2.jpg"],category: "Earrings", description: "cute bow earrings." },
        { id: 225, title: "pendant", pricePKR: 550, priceGBP: 16.99, discount: 3, img: "images/Pendants/p-6.jpeg","images": ["images/Pendants/p-6.jpeg","images/Pendants/p-6.1.jpeg","images/Pendants/p6.jpeg","images/Pendants/p-6.2.jpeg"], category: "pendants", description: "pendant " },
        { id: 226, title: "CLASSIC GOLDEN CHARM", pricePKR: 799, priceGBP: 19.99, discount: 8, img: "images/bracelets/b-5.jpeg", "images": ["images/bracelets/b-5.jpeg","images/bracelets/b-5.1.jpeg","images/bracelets/b-5.2.jpeg"],category: "bracelets", description: "An elegent hammered golden stainless steel cuff with smooth disc detailing, designed to reflect understated sophistication and modern charm." },
        { id: 227, title: "SLEEK DROP EDIT", pricePKR: 699, priceGBP: 14.99, discount: 6, category:"Pendants", img:"images/Pendants/P.jpeg" , images:["images/Pendants/P.jpeg","images/Pendants/P-1.png"], description: "stainless steel elegent sleek drop design pendent that will enhance your look!" },
        
        { id: 228, title: "ADD SOME VINTAGE", pricePKR: 499, priceGBP: 14.99, discount:5, img: "images/rings/r-6.jpeg", "images": ["images/rings/r-6.jpeg","images/rings/r-6.1.jpeg","images/rings/r-6.2.jpeg"],category: "oxidize", 
            description: "Add a touch of melody to your every step with these ghungroo rings from ROO7Z.✨These ghungroo rings are the perfect accessory to complete your ethnic look, adding a touch of tradition and playful charm.💫🤩They’ll not only make beautiful music, but will also become a treasured reminder of your most joyful celebrations.😍🌟SHOP NOW!" },
        
        { id: 229, title: "Muse Minimalist Studs", pricePKR: 450, priceGBP: 14.99, discount: 0,img: "images/earring/e-5.jpeg", "images":["images/earring/e-5.jpeg","images/earring/e-5.1.jpeg"],category: "Earrings", description: "Sleek, sculpted, and effortlessly chic — these brushed gold statement studs redefine modern elegance 💛. Featuring a smooth organic shape with a soft satin finish, they strike the perfect balance between bold and minimal.Lightweight yet impactful, these earrings are designed to elevate everyday outfits and add a refined touch to evening looks 🌟. A timeless essential for lovers of clean, contemporary style." },
            
        { id: 230, title: "Floral Pearl Pendants", pricePKR: 499, priceGBP: 9.99, discount: 0,isNew: true, category:"Pendants", img:"images/Pendants/pcollage.jpeg" , designs: [{ label: "Design 1", images: ["images/Pendants/P-C.jpeg","images/Pendants/P-C1.jpeg"] }, { label: "Design 2", images: ["images/Pendants/P-C2.jpeg","images/Pendants/P-C2.1.jpeg"] }, { label: "Design 3", images: ["images/Pendants/P-C3.jpeg","images/Pendants/P-C3.1.jpeg"] }, { label: "Design 4", images: ["images/Pendants/p-c4.jpeg","images/Pendants/p-c4.1.jpeg","images/Pendants/p-c4.2.jpeg"] },{ label: "Design 5", images: ["images/Pendants/p-c5.1.jpeg","images/Pendants/p-c5.jpeg"] }],  description: "Delicate, feminine, and effortlessly elegant — this Floral Pearl Pendant adds a graceful touch to any look. Designed with a beautifully crafted floral pattern, it features a luminous pearl at the center that radiates a soft, natural glow. The combination of the intricate flower detailing and the timeless charm of the pearl creates a piece that feels both classic and modern.Lightweight and comfortable to wear, this pendant is perfect for everyday elegance as well as special occasions. Whether paired with a casual outfit or a formal ensemble, it enhances your style with subtle sophistication." },
      


        { id: 231, title: "Ramadan Deal", pricePKR: 1499, priceGBP: 29.99, discount:0, isNew: true, img: "images/Pendants/Ramadan deal-1.jpeg","images": ["images/Pendants/Ramadan deal-1.jpeg","images/Pendants/p-7.jpeg","images/Pendants/id-4.jpeg","images/Pendants/id-5.jfif"], categories: ["pendants", "deals"], 
            description: "Celebrate this Ramadan with elegance and shine ✨Our premium gold-plated pendants are crafted with a luxury finish and minimal design, perfect for everyday wear and special occasions." },
         
        { id: 232, title: " Golden Leaf Luxe Bracelet ✨🍃", pricePKR: 899, priceGBP: 19.99, discount: 0,isNew: true, img: "images/bracelets/b-9.jpeg", "images": ["images/bracelets/b-9.jpeg","images/bracelets/b-9.1.jpeg"],category: "bracelets", description: "This elegant gold-tone cuff bracelet features a modern layered design with a beautiful central stone and crystal detailing for a premium luxury look. The open cuff style makes it easy to wear and comfortable for daily use and special occasions.Its sleek and classy design makes it perfect for parties, weddings, and everyday fashion. A must-have statement bracelet for modern women who love elegant jewelry."},
        


        { id: 234, title: "bangles", pricePKR: 1299, priceGBP: 24.99, discount:0,  img: "images/bracelets/bangle.1.jpeg","images": ["images/bracelets/bangle.1.jpeg","images/bracelets/bangle.jpeg","images/bracelets/bangle-2.jpeg"], sizes: ["2.4", "2.6", "2.8"], category: "bracelets", 
            description: "Elevate every outfit with these dazzling bangles! ✨ Perfect for stacking or wearing solo, they add a touch of sparkle and elegance to your everyday look. Lightweight, chic, and designed to shine with every movement—your wrists deserve this magic! 💖💫"},
        

         {
  id: 235,
  title: "Noor Heritage Pendant Set✨",
  pricePKR: 2499,
  priceGBP: 34.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/Pendants/p-11.jfif",
  images: ["images/Pendants/p-11.jfif", "images/Pendants/p-11.jpg"],
  category: "oxidize",
  description: "Inspired by timeless craftsmanship, our Noor Heritage Pendant Set beautifully blends tradition with elegance. Featuring a bold handcrafted oxidized silver pendant with intricate detailing and delicate ghunghroo accents, this set is paired with matching statement earrings for a complete royal look.Perfect for festive gatherings, cultural events, and elegant day wear, this piece enhances your outfit without overpowering it."
},

        { id: 236, title: "Islamic 4 Qul Sharif Gold plated Pendant", pricePKR: 1199, priceGBP: 19.99, discount: 0, category:"Pendants", img:"images/Pendants/islamic.jpeg" , images:["images/Pendants/islamic.jpeg","images/Pendants/4-qul.1.jpg"], description: "This beautiful 4 Qul Sharif pendant necklace features Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Naas, and Surah Al-Kafirun engraved in a premium round gold-tone design.The 4 Quls are known for protection, blessings, and spiritual peace, making this pendant a meaningful jewelry piece for daily wear and gifting. The elegant chain and polished finish give it a luxury look, perfect for both men and women." },
    
        { id: 237, title: "Golden Whisper Pendant", pricePKR: 699, priceGBP: 9.99, discount: 0, category:"Pendants", img:"images/Pendants/p-2.jpeg" , images:["images/Pendants/p-2.jpeg","images/Pendants/p-2.1.jpg","images/Pendants/p-2.2.png"], colors: ["Golden", "Silver"], description: "A delicate necklace featuring a luminous white stone centerpiece, framed in a finely detailed golden setting. Its minimal yet elegant design captures light beautifully, making it perfect for both everyday wear and special occasions. A timeless piece that adds effortless grace to any look." },
        
{ id: 238, title: "Citrine Crystal Jewelry Set", pricePKR: 1199, priceGBP: 19.99, discount: 0, isNew: true, variants: ["afterpin"],category:"Pendants", img:"images/Pendants/p-13.jpeg" , images:["images/Pendants/p-13.jpeg","images/Pendants/p-13.1.jpeg","images/Pendants/p-13.2.jpeg"], description: "Elevate your style with this stunning gold citrine crystal jewelry set, featuring a beautifully crafted ring, stud earrings, and pendant necklace. The radiant golden gemstone reflects warm sunlight tones, creating a luxurious and sophisticated look.Set in a sleek gold finish, the brilliant citrine crystals capture light from every angle, adding sparkle and elegance to your outfit. Perfect for everyday elegance, special occasions, or gifting, this timeless set complements both modern and classic styles."},
 
{id: 239,
  title: "Ethnic Multicolor Coin Drop Earrings",
  pricePKR: 799,
  priceGBP: 18.99,
  discount: 0,
  
  img: "images/earring/E-4.jpeg",
  images: ["images/earring/E-4.jpeg", "images/earring/E-4.1.jpeg","images/earring/E-4.2.jpeg"],
  category: "earrings",
  description: "Add a touch of bohemian charm and vintage elegance to your look with these stunning coin tassel statement earrings. Designed with intricate antique patterns, colorful beads, and dangling coin charms, these earrings create a bold and eye-catching style."
},
 

        
        { id: 240, title: "Vintage Majesty Statement Ring", pricePKR: 420, priceGBP: 13.99, discount:0,  img: "images/rings/r-7.jpeg","images": ["images/rings/r-7.jpeg","images/rings/r-7.1.png"],category: "rings", 
            description: "An exquisite statement ring crafted in an antique-inspired design, featuring a bold domed center framed by intricate engraved detailing 🌿. The oxidized silver finish enhances its vintage charm, adding depth and character to every curve 🖤.Perfect for elevating both traditional and contemporary looks, this eye-catching piece brings elegance, confidence, and individuality to your style 💍✨.😍🌟SHOP NOW!" },
       
        { id: 241, title: "Lattice Signet Ring", pricePKR: 449, priceGBP: 12.99, discount: 2, img: "images/rings/r-8.png", "images": ["images/rings/r-8.png","images/rings/r-8.3.png","images/rings/r-8.2.jpeg"],category: "rings", 
            description: "Add a touch of luxury to your everyday style with this stunning lattice signet ring. Designed with a detailed geometric pattern, this ring offers a bold yet elegant look, perfect for modern women who love timeless jewelry. Wear it solo for a classy statement or stack it with other rings for a trendy layered look.." },
        
        {id: 442, title: "Clover Statement Ring", pricePKR: 599, priceGBP: 12.99, discount: 0, img: "images/rings/r-9.1.jpg", "images": ["images/rings/r-9.1.jpg","images/rings/r-9.3.jpg","images/rings/r-9.2.jpg"],category: "rings", 
            description: "Elevate your style with this elegant golden clover ring, designed for modern elegance and everyday luxury. Lightweight & comfortable fit,The sleek white clover motif paired with a gold-tone band creates a timeless, classy look that complements both casual and formal outfits. Perfect for stacking or wearing solo as a statement piece." },  
        
        { id: 243, title: "Golden Aura Cuff Bracelet", pricePKR: 899, priceGBP: 16.99, discount: 0,isNew: true, img: "images/bracelets/b-8.png", "images": ["images/bracelets/b-8.png","images/bracelets/b-8.1.png"],category: "bracelets", description: "This elegant gold-tone cuff bracelet features a modern layered design with a beautiful central stone and crystal detailing for a premium luxury look. The open cuff style makes it easy to wear and comfortable for daily use and special occasions.Its sleek and classy design makes it perfect for parties, weddings, and everyday fashion. A must-have statement bracelet for modern women who love elegant jewelry."},
        
        { id: 244, title: "Spark Bow Earrings", pricePKR: 450, priceGBP: 14.99, discount: 0,img: "images/earring/e.jpeg", "images":["images/earring/e.jpeg","images/earring/e.1.png","images/earring/e.2.png","images/earring/e.3.jpg"],category: "Earrings", description: "Add a touch of charm and sophistication to your look with these elegant spark bow earrings. Designed with a delicate bow shape and sparkling finish, these earrings bring a perfect balance of cute and classy style. Lightweight and comfortable for daily wear, they are ideal for parties, casual outings, or gifting someone special. Shine with elegance wherever you go!" },
        
        {id: 245,
  title: "Elegant Kashmiri Bangles",
  pricePKR: 450,
  priceGBP: 14.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  sets: [
    { label: "Set of 2", pricePKR: 450 },
    { label: "Set of 4", pricePKR: 650 },
    { label: "Set of 6", pricePKR: 899 },
    { label: "Set of 8", pricePKR: 1199 }
  ],
  img: "images/bracelets/kb-4.jpeg",
  images: ["images/bracelets/kb-4.jpeg", "images/bracelets/kashmiri bangles.jpeg","images/bracelets/kb-2.jpeg","images/bracelets/kb-5.jpeg"],
  category: "bracelets",
  sizes: ["2.4", "2.6"],
  description: "Add a touch of tradition and elegance to your look with this beautiful set of 4 Kashmiri bangles. Designed with intricate patterns inspired by Kashmiri craftsmanship, these bangles are perfect for festive occasions, weddings, and everyday ethnic styling."
},
 {id: 246,
  title: "Elegant Eid Bangles",
  pricePKR: 499,
  priceGBP: 14.99,
  discount: 0,
  img: "images/bracelets/gb.jpeg",
  images: ["images/bracelets/gb.jpeg","images/bracelets/gb-1.jpg","images/bracelets/gb-2.jpg","images/bracelets/gb-3.jpg"],
  category: "bracelets",
  sizes: ["2.5"],
  description: "Add a touch of tradition and elegance to your look with this beautiful set of 4 Kashmiri bangles. Designed with intricate patterns inspired by Kashmiri craftsmanship, these bangles are perfect for festive occasions, weddings, and everyday ethnic styling."
},
{ id: 247, title: "Golden Hearts Drop Necklace", pricePKR: 499, priceGBP: 9.99, discount: 0, category:"Pendants", img:"images/Pendants/id-3.1.jpeg" , images:["images/Pendants/id-3.1.jpeg","images/Pendants/id-3.3.jpeg","images/Pendants/id-3.jpeg"],  description: "Delicate, romantic, and effortlessly chic — our Golden Hearts Drop Necklace is designed to add a soft glow to your everyday style. Featuring multiple polished heart charms cascading gracefully along a fine gold chain, this piece symbolizes love, elegance, and timeless beauty." },



{id: 248,
  title: "Golden Link Luxe Earrings",
  pricePKR: 499,
  priceGBP: 13.99,
  discount: 0,
  
   variants: ["afterpin"],
  img: "images/earring/chain.jpg",
  images: ["images/earring/chain-1.jpg", "images/earring/chain-2.jpg"],
  category: "earrings",
  description: "Make a bold yet refined statement with these elegant golden link earrings. Designed with interlocking rectangular shapes, this piece blends modern minimalism with timeless luxury. The polished gold finish reflects light beautifully, giving a rich and sophisticated shine that instantly elevates your look."
},
 
   {id: 249,
  title: "Silver Petal Bloom Earrings",
  pricePKR: 499,
  priceGBP: 12.99,
  discount: 2,
  img: "images/earring/e-s.jpeg",
  images: ["images/earring/e-s.jpeg", "images/earring/e-s-1.jpeg","images/earring/e-s-2.jpeg"],
  category: "earrings",
  description: "Grace meets modern elegance in these stunning silver petal earrings. Designed with a sleek, mirror-like finish, each piece reflects light beautifully, creating a soft yet luxurious shine. The floral-inspired shape adds a delicate feminine touch while keeping the look bold and contemporary.Perfect for both everyday wear and special occasions, these earrings elevate any outfit effortlessly—whether you’re dressing up for an event or adding a classy statement to your casual look. Lightweight, stylish, and timeless—this is a must-have addition to your jewelry collection."
},
   
{id: 250,
  title: "Shaan-e-Riwaayat",
  pricePKR: 1899,
  priceGBP: 32.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/Pendants/p-12.png",
  images: ["images/Pendants/p-12.png","images/Pendants/p-12.1.jpeg", "images/Pendants/p-12.2.png"],
  category: "oxidize",
  description: "This traditional oxidized silver set features a bold engraved square pendant with delicate hanging details, paired with ghungroo bead style statement earrings. The intricate metalwork and clustered ghungroo beads create a beautiful rhythmic charm, adding movement and heritage appeal to your look."
},

  {id: 251,
  title: "ROYAL PEACOCK JHUMKA",
  pricePKR: 799,
  priceGBP: 24.99,
  discount: 0,
  img: "images/earring/e-12.jpeg",
  images: ["images/earring/e-12.jpeg", "images/earring/e-12.1.jpeg"],
  category: "earrings",
  description: "Add a touch of traditional elegance with these beautifully crafted silver jhumka earrings. Designed with intricate peacock and floral motifs, these earrings feature stunning deep blue stone embellishments and delicate pearl drop detailing that enhance their royal appeal."

},
{id: 252,
  title: "Elegant Floral Bracelet",
  pricePKR: 899,
  priceGBP: 19.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/bracelets/b-10.jpeg",
  images: ["images/bracelets/b-10.jpeg","images/bracelets/b-10.1.jpeg","images/bracelets/b-10.2.jpeg"],
  category: "bracelets",
  description: "Add a touch of elegance to your jewelry collection with this beautifully crafted bracelet. Designed with intricate floral cutwork and subtle stone detailing, this piece blends traditional charm with modern luxury. Lightweight and comfortable, it’s perfect for both everyday wear and special occasions. A timeless accessory that enhances any outfit with effortless grace ✨"
},

{id: 253,
  title: "MODERN HERITAGE SILHOUETTES",
  pricePKR: 499,
  priceGBP: 18.99,
  discount: 0,
  img: "images/earring/E-10.png",
  images: ["images/earring/E-10.png", "images/earring/E-10.1.png","images/earring/E-10.2.png"],
  category: "earrings",
  description: "Make a bold style statement with these modern sculpted wave earrings. Designed with a unique flowing shape and polished metallic finish, these earrings add an artistic touch to any outfit. Their lightweight design ensures comfortable wear while the abstract silhouette gives a chic, fashion-forward look. Perfect for parties, date nights, or elevating everyday outfits."

},

{id: 254,
  title: "Sultana Oxidized Statement Set",
  pricePKR: 2499,
  priceGBP: 36.99,
  discount: 0,
  variants: ["afterpin"],
  img: "images/Pendants/p-14.jpg",
  images: ["images/Pendants/p-14.jpg", "images/Pendants/p-14.1.jpg","images/Pendants/p-13.2.jpg","images/Pendants/p-14.3.jpg"],
  category: "oxidize",
  description:"Elevate your ethnic wardrobe with this exquisite oxidized silver jewelry set. This statement piece features a grand, multi-layered Rani Haar (queen's necklace) adorned with intricate tribal motifs and delicate silver droplets. The set is complemented by matching square-drop earrings and a textured bangle, all finished with a vintage patina that pairs perfectly with handloom sarees and festive silks."},


 
{id: 255,
title: "Wing Statement Ring",
  pricePKR: 399,
  priceGBP: 11.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/rings/wing.jpeg",
  images: ["images/rings/wing.jpeg","images/rings/wing-1.jpeg","images/rings/wing-2.jpeg","images/rings/wing-3.jpeg"],
  category: "rings",
  description: "Crafted to stand out, this dual-edge ring blends bold structure with intricate texture. Its symmetrical design creates a powerful visual balance, making it more than just jewelry — it’s a statement of confidence.Designed for modern minimalists who prefer impact without excess. Whether styled casually or formally, this ring adds instant depth to your look."
},




{id: 256,
  title: "Golden Geometric Twist Hoops",
  pricePKR: 499,
  priceGBP: 13.99,
  discount: 0,
  variants: ["afterpin"],
  isNew: true,
  img: "images/earring/e-17.jpeg",
  images: ["images/earring/e-17.jpeg", "images/earring/e-17-1.jpeg","images/earring/e-17-2.jpeg","images/earring/e-17-3.jpeg","images/earring/e-17-4.jpeg"],
  category: "earrings",
  description: "Elevate your style with these stunning golden geometric twist hoops, designed to make a bold yet elegant statement. Crafted with multiple interwoven lines, the unique structure creates a modern artistic look that stands out effortlessly.Worn by the model, these earrings beautifully frame the face, adding a touch of sophistication and contemporary charm. The polished gold finish enhances their luxurious appeal, making them perfect for both day and evening wear. Whether paired with minimal outfits or dressed-up looks, these earrings bring confidence, style, and a refined edge to your overall appearance."
},

{ id: 257, title: "The Celestial Talon Statement Necklace", 
     pricePKR: 999, priceGBP: 25.99, discount: 5, 
     img:"images/Pendants/spike.jpeg",
      isNew: true,
    "images": ["images/Pendants/spike.jpeg","images/Pendants/spike-1.jpg","images/Pendants/spike.1.jpg","images/Pendants/spike-5.jpeg"] ,
    category: "pendants", description: "Unleash your inner goddess. ✨ Where sharp design meets soft elegance. This ivory and gold masterpiece is made for those who don’t mind being the center of attention.Detailing that speaks volumes. 🤍✨ The perfect finishing touch for your next big event." },

    {id: 258,
  title: "Midnight Melt Ring 💛",
  pricePKR: 399,
  priceGBP: 11.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/rings/U-cuff Ring1.jpeg",
  images: ["images/rings/U-cuff Ring1.jpeg","images/rings/U-cuff Ring2.jpeg","images/rings/U-cuff Ring3.jpeg","images/rings/U-cuff Ring4.jpeg"],
  category: "rings",
  description: "Meet the ring that does effortless luxury without trying too hard. Designed with a smooth, fluid silhouette, this gold-toned statement piece brings a modern, sculptural feel to your everyday look. The unique U-shaped front gives it that “wait… where did you get that?” effect 👀Perfect for stacking or wearing solo, it’s minimal yet bold — exactly what your aesthetic needs. Whether you’re dressing up or keeping it chill, this ring adds that quiet flex 💅"
},

{ id: 259, title:" صبر ", pricePKR: 650, priceGBP: 21.99, discount: 0, isNew: true,variants: ["afterpin"],
   img: "images/bracelets/sabar.jpeg", "images": ["images/bracelets/sabar.jpeg","images/bracelets/sabar-1.jpeg","images/bracelets/sabar-2.jpeg"],category: "bracelets", 
   description: "A delicate bracelet engraved with the powerful reminder “شکر • صبر • توکل” — a beautiful symbol of faith, patience, and gratitude. Designed with a minimal yet elegant style, this bracelet is perfect for everyday wear or as a meaningful gift for someone special. Its timeless design adds a subtle touch of luxury while keeping a deep spiritual message close to your heart."},
   


{id: 260,
  title: "floral bracelet",
  pricePKR: 550,
  priceGBP: 9.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/bracelets/floral.1.jpeg",
  images: ["images/bracelets/floral.1.jpeg","images/bracelets/floral.jpeg","images/bracelets/floral.3.jpeg","images/bracelets/floral.2.jpeg"],
  category: "bracelets",
  description: "This beautiful floral bracelet is designed with a fine gold-tone chain, featuring delicate flower charms and sparkling stones for a graceful look. 🌼✨Perfect for daily wear or special occasions, it adds a subtle yet elegant touch to your style. Lightweight, adjustable, and easy to wear — a must-have accessory for every jewelry lover 💛"
},

{id: 261,
  title: "Sculpture beauty",
  pricePKR: 799,
  priceGBP: 12.99,
  discount: 0,
  img: "images/Pendants/golden necklace/golden.jpeg",
  images: ["images/Pendants/golden necklace/golden.jpeg","images/Pendants/golden necklace/golden.1.jpeg","images/Pendants/golden necklace/golden.2.jpeg","images/Pendants/golden necklace/golden.3.jpeg"],
  category: "pendants",
  description: "A bold gold necklace designed like wearable sculpture—structured, striking, and impossible to ignore. The intricate geometric drops create movement and depth, catching light with every turn. Perfect for those who see jewelry as more than decoration—its expression, power, and identity."
},

{id: 262,
  title: "Mystic Power Drop Earrings",
  pricePKR: 499,
  priceGBP: 13.99,
  discount: 0,
  
  img: "images/earring/thor/thor.jpeg",
  images: ["images/earring/thor/thor.jpeg", "images/earring/thor/thor-2.jpeg","images/earring/thor/thor-3.jpeg","images/earring/thor/thor-4.jpeg","images/earring/thor/thor-5.jpeg"],
  category: "earrings",
  description: "Unleash bold elegance with these hammer-inspired statement earrings, designed for those who embrace strength and individuality. Featuring intricate detailing and a rugged metallic finish, these earrings blend modern edge with ancient symbolism.Suspended delicately yet striking in presence, they create a powerful visual impact—perfect for elevating both casual and statement looks. The dark, moody aesthetic paired with fine craftsmanship makes them a must-have for trendsetters.Power meets style ⚡Upgrade your look with these bold statement earrings.Shop now 🛍️"

},


  {id: 263,
  title: "Triple-row Peridot Statement Ring",
  pricePKR: 699,
  priceGBP: 19.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/rings/triple.jpeg",
  images: ["images/rings/triple.jpeg","images/rings/triple-row.jpeg","images/rings/triple-2.jpeg","images/rings/triple-3.jpeg"],
  category: "rings",
  description: "Elevate your jewelry collection with this stunning Triple-Row Peridot Statement Ring. Designed for those who appreciate bold luxury, this ring features two outer rows of vibrant, square-cut peridot green stones, perfectly complemented by a shimmering center row of micro-pavé crystals.The wide, high-polish sterling silver band offers a modern, structural look, while the intricate filigree detailing on the sides adds a touch of classic craftsmanship. Whether worn as a standout piece for a special event or as a signature daily accessory, this ring is the ultimate blend of nature-inspired color and high-end glamour."
},
{id: 264,
  title: "Gothic Cross Studs",
  pricePKR: 499,
  priceGBP: 13.99,
  discount: 0,
   isNew: true,
  variants: ["afterpin"],
  img: "images/earring/black.jpeg",
  images: ["images/earring/black.jpeg", "images/earring/black-1.jpeg","images/earring/Black-2.jpeg"],
  category: "earrings",
  description: "These exquisite square stud earrings feature a central gold-tone gothic cross set against a rich, textured black enamel inlay. Framed by a scalloped gold border, they offer a vintage aesthetic that pairs perfectly with both evening wear and elevated daily outfits.Shop now 🛍️"

},

{id: 265,
  title: "Baroque Pearl Chain Bracelet",
  pricePKR: 550,
  priceGBP: 16.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/bracelets/pearl/pearl.jpeg",
  images: ["images/bracelets/pearl/pearl.jpeg","images/bracelets/pearl/pearl-1.jpeg","images/bracelets/pearl/pearl-2.jpeg","images/bracelets/pearl/pearl-3.jpeg"],
  category: "bracelets",
  description: "Experience the perfect blend of organic beauty and modern minimalism with this delicate pearl bracelet. Featuring a stunning sequence of natural-shaped baroque pearls and polished round accents, this piece is held together by a slender, high-shine gold-toned chain. Its lightweight design and adjustable fit make it an effortless choice for adding a touch of sophisticated soft luxury to any outfit."
},


{id: 266,
  title: "Golden Sunburst Pearl Ring",
  pricePKR: 399,
  priceGBP: 11.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/rings/sunflower1.jpeg",
  images: ["images/rings/sunflower1.jpeg","images/rings/sunflower.jpeg","images/rings/sunflower2.jpeg","images/rings/sun.jpeg"],
  category: "rings",
  description: "A stylish gold ring shaped like a sunburst with a centered pearl, perfect for adding a touch of elegance to any outfit."
},


{id: 267,
  title: "Tribal Frame Bell Drop Earrings",
  pricePKR: 599,
  priceGBP: 11.99,
  discount: 0,
  isNew: true,
  variants: ["afterpin"],
  img: "images/earring/framebell.jpeg",
  images: ["images/earring/framebell.jpeg", "images/earring/framebell-1.jpeg","images/earring/framebell-2.jpeg","images/earring/framebell-3.jpeg"],
  category: "earrings",
  description: "These stunning oxidized silver earrings offer a beautiful blend of boho-chic style and vintage elegance. The unique open rectangular frame is decorated with intricate textured engravings and features delicate silver ghungroo drops that add a soft and melodic charm to your every movement. Crafted with a premium antique matte finish, these earrings provide an authentic tribal look while remaining remarkably lightweight for all-day comfort. Whether you are dressing up for a festive occasion or adding a fusion touch to your everyday Western outfit, these statement pieces are designed to be the highlight of your ensemble."
},
],






};

// Set global variable for use across the app
window.allProducts = allProducts;

// Dispatch event when products are loaded
window.dispatchEvent(new Event('productsLoaded'));
