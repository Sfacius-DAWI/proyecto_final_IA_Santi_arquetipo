import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface TourGalleryProps {
  images: string[];
  title: string;
}

const TourGallery: React.FC<TourGalleryProps> = ({ images, title }) => {
  const [mainImage, setMainImage] = useState(images[0] || "");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Eliminar duplicados en imágenes
  const uniqueImages = Array.from(new Set(images));

  const handleThumbnailClick = (image: string, index: number) => {
    setMainImage(image);
    setSelectedIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = (selectedIndex - 1 + uniqueImages.length) % uniqueImages.length;
    setMainImage(uniqueImages[newIndex]);
    setSelectedIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % uniqueImages.length;
    setMainImage(uniqueImages[newIndex]);
    setSelectedIndex(newIndex);
  };

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div 
            className="relative w-full h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => setIsDialogOpen(true)}
          >
            <img 
              src={mainImage} 
              alt={`${title} - Vista principal`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium">Ver galería completa</span>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <div className="relative w-full h-[80vh] flex flex-col">
            <button 
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center z-10"
              onClick={() => setIsDialogOpen(false)}
            >
              <X size={20} />
            </button>
            
            <div className="flex-1 relative">
              <img 
                src={mainImage} 
                alt={`${title} - Vista ampliada`} 
                className="w-full h-full object-contain"
              />
              
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
                onClick={handlePrevious}
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
                onClick={handleNext}
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            <div className="h-20 bg-black p-2 flex items-center">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {uniqueImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer ${index === selectedIndex ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleThumbnailClick(image, index)}
                  >
                    <img 
                      src={image} 
                      alt={`${title} - Miniatura ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-5 gap-2">
        {uniqueImages.slice(0, 5).map((image, index) => (
          <div 
            key={index} 
            className={`${index === 0 ? 'col-span-3 row-span-2' : 'col-span-1'} h-24 md:h-32 overflow-hidden rounded-lg cursor-pointer ${image === mainImage ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleThumbnailClick(image, index)}
          >
            <img 
              src={image} 
              alt={`${title} - ${index + 1}`} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourGallery; 