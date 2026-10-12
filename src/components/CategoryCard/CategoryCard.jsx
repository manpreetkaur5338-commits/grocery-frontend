import "./CategoryCard.css";

const CategoryCard = ({ category, isSelected, onClick }) => {
  return (
    <button
      type="button"
      className={`category-card ${isSelected ? "selected" : ""}`}
      onClick={() => onClick(category.id, category.name)}
      aria-label={`View ${category.name}, ${category.count}`}
    >
      <div className="category-image-wrap">
        <img
          src={category.image}
          alt={category.name}
          className="category-image"
          loading="lazy"
        />
      </div>
      <div className="category-details">
        <h3 className="category-name">{category.name}</h3>
        <span className="category-count">{category.count}</span>
      </div>
    </button>
  );
};

export default CategoryCard;
