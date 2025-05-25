import PromoBanner from "../components/PromoBanner";
import { IMAGES } from "@/constants/images";

const promoMessages = [
  "Explore the best tourist routes with our expert guides!",
  "Book guided tours over $100 and get a free souvenir with code TOURISTDEAL",
  "For free shipping on orders over $100 and more use code FREESHIPPINGYAY"
];

const About = () => {
  return (
    <div className="min-h-screen">
      <PromoBanner messages={promoMessages} />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-12">
        <div className="container-custom">
          <h1 className="heading-xl text-white text-center mb-4">About Adventure Tours</h1>
          <p className="text-center text-white/80 max-w-2xl mx-auto">
            Your trusted partner for unforgettable travel experiences. Discover our story, mission, and what makes our tours special.
          </p>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="container-custom section-padding">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="heading-md mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Adventure Tours began with a simple passion: sharing the beauty of the world with fellow travelers. Founded in 2015, we started as a small team of travel enthusiasts who wanted to create meaningful travel experiences beyond the typical tourist attractions.
            </p>
            <p className="text-gray-700">
              Today, we've grown into a trusted tour provider with operations across multiple countries, but our core mission remains unchanged: to connect travelers with authentic experiences, breathtaking destinations, and the rich cultural tapestry of each location we visit.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src={IMAGES.about.story}
              alt="Our story"
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>
      
      {/* Our Mission */}
      <section className="bg-secondary">
        <div className="container-custom section-padding">
          <h2 className="heading-md text-center mb-12">Our Mission & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-center">Authentic Experiences</h3>
              <p className="text-gray-600 text-center">
                We believe in providing genuine cultural immersion and meaningful interactions with local communities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-center">Sustainable Tourism</h3>
              <p className="text-gray-600 text-center">
                We are committed to minimizing our environmental impact and supporting local economies in all our operations.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-center">Personalized Service</h3>
              <p className="text-gray-600 text-center">
                Every traveler is unique, which is why we offer customizable experiences tailored to individual preferences.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* What We Offer */}
      <section className="container-custom section-padding">
        <h2 className="heading-md text-center mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-secondary p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Curated Travel Packages</h3>
            <p className="text-gray-700 mb-4">
              Our team of travel experts selects the best destinations and creates thoughtfully designed itineraries to ensure you experience the essence of each location. From cultural landmarks to hidden gems, our tours cover it all.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                City Tours
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Nature Expeditions
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cultural Immersions
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Adventure Activities
              </li>
            </ul>
          </div>
          
          <div className="bg-secondary p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Expert Local Guides</h3>
            <p className="text-gray-700 mb-4">
              Our guides are the heart of Adventure Tours. Each guide is carefully selected for their knowledge, passion, and ability to create meaningful connections with travelers. They're not just experts in local history and culture—they're storytellers who bring destinations to life.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Local Expertise
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Multilingual Services
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Personalized Attention
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Safety-Focused
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="bg-secondary">
        <div className="container-custom section-padding">
          <h2 className="heading-md text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, index) => (
                  <svg key={index} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The mountain hike tour exceeded all my expectations. Our guide was knowledgeable, friendly, and made sure everyone enjoyed the experience. I'll definitely book with Adventure Tours again!"
              </p>
              <p className="font-medium">- Sarah Johnson</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, index) => (
                  <svg key={index} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The historical city tour gave us insights we would never have discovered on our own. The small group size made it personal, and Maria's knowledge of local history was impressive."
              </p>
              <p className="font-medium">- David Chen</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, index) => (
                  <svg key={index} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "We've taken multiple tours with Adventure Tours, and each one has been fantastic. The sunset excursion was particularly magical - perfect spots for photos and a knowledgeable guide."
              </p>
              <p className="font-medium">- Emma and James Wilson</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="container-custom section-padding">
        <div className="bg-primary text-white rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Start Your Adventure Today</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Ready to explore the world with us? Browse our tour packages and find your perfect adventure. 
              Our team is ready to help you plan an unforgettable travel experience.
            </p>
            <button className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-md font-medium">
              Browse Tours
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
