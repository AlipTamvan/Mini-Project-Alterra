const EnvironmentalFacts = () => {
    return (
      <section id="facts" className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-700">
          Environmental Facts
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            "The Amazon rainforest produces 20% of the world's oxygen.",
            "Over 8 million tons of plastic end up in our oceans every year.",
            "A single tree can absorb up to 48 pounds of CO2 per year.",
            "The Earth loses 18.7 million acres of forests annually.",
          ].map((fact, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-green-600">
                Fact #{index + 1}
              </h3>
              <p>{fact}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  export default EnvironmentalFacts;