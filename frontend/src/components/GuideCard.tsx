
export interface GuideType {
  id: number;
  name: string;
  image: string;
  specialties: string[];
  description: string;
  isAvailable: boolean;
}

interface GuideCardProps {
  guide: GuideType;
}

const GuideCard = ({ guide }: GuideCardProps) => {
  const { name, image, specialties, description, isAvailable } = guide;
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full ${
          isAvailable ? 'bg-green-500' : 'bg-red-500'
        } text-white text-sm font-medium`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-medium mb-2">{name}</h3>
        <div className="mb-3 flex flex-wrap gap-1">
          {specialties.map((specialty, index) => (
            <span 
              key={index} 
              className="text-xs bg-secondary px-2 py-1 rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default GuideCard;
