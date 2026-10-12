import Hero from "../../components/Hero/Hero";
import Categories from "../../components/Categories/Categories";
import Deals from "../../components/Deals/Deals";
import ProductSection from "../../components/ProductSection/ProductSection";
import PromoBanner from "../../components/PromoBanner/PromoBanner";
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";
import Newsletter from "../../components/Newsletter/Newsletter";
import Footer from "../../components/Footer/Footer";

const HomePage = ({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  cartItems,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onOpenCart,
  onSelectCategory,
  onViewAll,
  onDealClick,
  scrollToSection,
  showToast
}) => {
  return (
    <>
      <main id="main-content">
        {/* 1. Hero Section */}
        <Hero
          onShopClick={() => scrollToSection("products-section")}
          onCategoriesClick={() => scrollToSection("categories-section")}
        />

        {/* 2. Featured Categories Section */}
        <Categories
          activeCategory={activeCategory}
          onSelectCategory={onSelectCategory}
          onViewAll={onViewAll}
        />

        {/* 3. Fresh Deals Section */}
        <Deals onDealClick={onDealClick} />

        {/* 4. Best Sellers & Product Section with Live Search & Tabs */}
        <ProductSection
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
          cartItems={cartItems}
          onAddToCart={onAddToCart}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
        />

        {/* 5. Editorial Promotional Banner */}
        <PromoBanner onShopNow={() => scrollToSection("products-section")} />

        {/* 6. Why Choose Us Section */}
        <WhyChooseUs />

        {/* 7. Newsletter Subscription */}
        <Newsletter onNotify={(msg) => showToast(msg)} />
      </main>

      {/* 8. Editorial Footer */}
      <Footer onCategoryClick={onSelectCategory} />
    </>
  );
};

export default HomePage;
