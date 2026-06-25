package com.mpesa.africa.biashara.book.config;

import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.model.entity.Product;
import com.mpesa.africa.biashara.book.model.entity.ProductCategory;
import com.mpesa.africa.biashara.book.model.enums.InventoryTypes;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.InventoryRepository;
import com.mpesa.africa.biashara.book.repository.ProductCategoryRepository;
import com.mpesa.africa.biashara.book.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClothingStoreDataSeeder implements ApplicationRunner {

    private static final List<String> CATEGORY_NAMES = List.of(
            "Tops & Shirts",
            "Outerwear & Hoodies",
            "Bottoms",
            "Footwear & Accessories"
    );

    private static final List<SeedProduct> PRODUCTS = List.of(
            new SeedProduct(
                    "White Crewneck T-Shirt",
                    "Tops & Shirts",
                    "A clean everyday crewneck tee in crisp white cotton.",
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
                    42.0,
                    450.00,
                    900.00
            ),
            new SeedProduct(
                    "Black Graphic Tee",
                    "Tops & Shirts",
                    "A relaxed black tee with a bold graphic finish.",
                    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
                    36.0,
                    520.00,
                    1100.00
            ),
            new SeedProduct(
                    "Classic Blue Denim Shirt",
                    "Tops & Shirts",
                    "A timeless blue denim shirt for casual layering.",
                    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80",
                    24.0,
                    950.00,
                    1800.00
            ),
            new SeedProduct(
                    "Casual Linen Button-Down",
                    "Tops & Shirts",
                    "A breathable linen button-down for warm days.",
                    "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80",
                    28.0,
                    850.00,
                    1650.00
            ),
            new SeedProduct(
                    "Minimalist Gray Hoodie",
                    "Outerwear & Hoodies",
                    "A soft gray hoodie with a simple, versatile silhouette.",
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
                    18.0,
                    1400.00,
                    2600.00
            ),
            new SeedProduct(
                    "Classic Leather Jacket",
                    "Outerwear & Hoodies",
                    "A structured leather jacket for polished casual outfits.",
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
                    10.0,
                    3500.00,
                    6200.00
            ),
            new SeedProduct(
                    "Beige Trench Coat",
                    "Outerwear & Hoodies",
                    "A lightweight beige trench coat with a refined drape.",
                    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
                    12.0,
                    2600.00,
                    4800.00
            ),
            new SeedProduct(
                    "Olive Bomber Jacket",
                    "Outerwear & Hoodies",
                    "A casual olive bomber jacket with an easy streetwear feel.",
                    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
                    16.0,
                    2200.00,
                    3900.00
            ),
            new SeedProduct(
                    "Classic Blue Jeans",
                    "Bottoms",
                    "Dependable blue denim jeans with a classic fit.",
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
                    30.0,
                    1250.00,
                    2400.00
            ),
            new SeedProduct(
                    "Khaki Chino Pants",
                    "Bottoms",
                    "Smart khaki chinos for office-to-weekend wear.",
                    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80",
                    26.0,
                    1100.00,
                    2200.00
            ),
            new SeedProduct(
                    "Black Tailored Trousers",
                    "Bottoms",
                    "Clean black trousers with a tailored profile.",
                    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
                    22.0,
                    1350.00,
                    2600.00
            ),
            new SeedProduct(
                    "White Minimalist Sneakers",
                    "Footwear & Accessories",
                    "Low-profile white sneakers for everyday styling.",
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
                    20.0,
                    1800.00,
                    3400.00
            ),
            new SeedProduct(
                    "Leather Boots",
                    "Footwear & Accessories",
                    "Durable leather boots with a classic rugged finish.",
                    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80",
                    14.0,
                    2600.00,
                    4900.00
            ),
            new SeedProduct(
                    "Canvas Baseball Cap",
                    "Footwear & Accessories",
                    "A simple canvas cap for casual finishing touches.",
                    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80",
                    35.0,
                    350.00,
                    750.00
            )
    );

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final BusinessRepository businessRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedClothingStoreProducts()
                .doOnSuccess(ignored -> log.info("Clothing store product seed completed"))
                .doOnError(error -> log.error("Clothing store product seed failed", error))
                .block();
    }

    private Mono<Void> seedClothingStoreProducts() {
        return seedCategories()
                .collectMap(category -> category.getName().toLowerCase(Locale.ROOT), Function.identity())
                .flatMapMany(categoriesByName -> businessRepository.findAll()
                        .flatMap(business -> seedProductsForBusiness(business, categoriesByName)))
                .then();
    }

    private Flux<ProductCategory> seedCategories() {
        return Flux.fromIterable(CATEGORY_NAMES)
                .flatMap(categoryName -> productCategoryRepository.findByName(categoryName)
                        .switchIfEmpty(productCategoryRepository.save(ProductCategory.builder()
                                .name(categoryName)
                                .build())));
    }

    private Flux<Product> seedProductsForBusiness(
            Business business,
            Map<String, ProductCategory> categoriesByName
    ) {
        return Flux.fromIterable(PRODUCTS)
                .flatMap(seedProduct -> seedProductForBusiness(business, seedProduct, categoriesByName));
    }

    private Mono<Product> seedProductForBusiness(
            Business business,
            SeedProduct seedProduct,
            Map<String, ProductCategory> categoriesByName
    ) {
        ProductCategory category = categoriesByName.get(seedProduct.categoryName().toLowerCase(Locale.ROOT));
        if (category == null) {
            return Mono.error(new IllegalStateException("Missing product category: " + seedProduct.categoryName()));
        }

        return productRepository.findByBusinessIdAndName(business.getId(), seedProduct.name())
                .switchIfEmpty(productRepository.save(Product.builder()
                        .name(seedProduct.name())
                        .photoUrl(seedProduct.photoUrl())
                        .description(seedProduct.description())
                        .productCategoryId(category.getId())
                        .userId(business.getUserId())
                        .businessId(business.getId())
                        .build()))
                .flatMap(product -> seedInventoryForProduct(product, seedProduct));
    }

    private Mono<Product> seedInventoryForProduct(Product product, SeedProduct seedProduct) {
        return inventoryRepository.findByUserIdAndProductId(product.getUserId(), product.getId())
                .hasElements()
                .flatMap(hasInventory -> {
                    if (hasInventory) {
                        return Mono.just(product);
                    }

                    return inventoryRepository.save(Inventory.builder()
                                    .productId(product.getId())
                                    .quantity(seedProduct.quantity())
                                    .inventoryType(InventoryTypes.count)
                                    .unitPurchasePrice(seedProduct.unitPurchasePrice())
                                    .unitSalePrice(BigDecimal.valueOf(seedProduct.unitSalePrice()))
                                    .priceIncludesTax(false)
                                    .userId(product.getUserId())
                                    .build())
                            .thenReturn(product);
                });
    }

    private record SeedProduct(
            String name,
            String categoryName,
            String description,
            String photoUrl,
            Double quantity,
            Double unitPurchasePrice,
            Double unitSalePrice
    ) {
    }
}
