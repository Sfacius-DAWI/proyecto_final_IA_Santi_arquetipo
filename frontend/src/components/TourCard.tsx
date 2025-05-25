import { Link } from "react-router-dom";
import { TourType } from "../types/tour";

interface TourCardProps {
  tour: TourType;
}

const TourCard = ({ tour }: TourCardProps) => {
  const { id, title, image, price, tag, tagType, description } = tour;
  
  console.log('Renderizando TourCard:', { id, title, image, price, tag, tagType, description });
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <Link to={`/tour/${id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {tag && (
            <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded ${
              tagType === "new" ? "bg-accent" : 
              tagType === "limited" ? "bg-primary" : 
              "bg-green-500"
            } text-white`}>
              {tag}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg">{title}</h3>
            <span className="font-medium text-accent">${price}</span>
          </div>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default TourCard;
