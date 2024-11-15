import { Droplet, Sun, Wind, Recycle } from "lucide-react";

const EnvironmentalTopics = () => {
  return (
    <section id="intro" className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-700">
        Environmental Topics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Droplet, title: "Water", desc: "Water Conservation" },
          { icon: Sun, title: "Energy", desc: "Renewable Energy" },
          { icon: Wind, title: "Air", desc: "Air Quality" },
          { icon: Recycle, title: "Recycle", desc: "Waste Management" },
        ].map(({ icon: Icon, title, desc }, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-200"
          >
            <Icon className="text-green-500 mb-2" size={40} />
            <span className="text-sm font-medium text-gray-600">{title}</span>
            <span className="text-xs text-gray-500">{desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EnvironmentalTopics;
