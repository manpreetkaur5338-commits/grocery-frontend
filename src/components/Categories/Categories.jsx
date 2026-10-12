import { FiArrowRight } from "react-icons/fi";
import CategoryCard from "../CategoryCard/CategoryCard";
import categories from "../../data/categories";
import "./Categories.css";

const Categories = ({ activeCategory, onSelectCategory, onViewAll }) => {
  return (
    <section className="categories-section" id="categories-section" aria-label="Featured Categories">
      <div className="container">
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="section-eyebrow">Explore Collections</span>
            <h2 className="section-title">Featured Categories</h2>
          </div>
          <button 
            type="button" 
            className="section-link"
            onClick={onViewAll}
            aria-label="View all categories and products"
          >
            <span>View All</span>
            <FiArrowRight />
          </button>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={activeCategory === cat.name || activeCategory === cat.id}
              onClick={() => onSelectCategory(cat.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
