// Destination data structure for dynamic routing
export interface Location {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  whyVisit: string[];
  bestTime: string;
  topAttractions: string[];
  thingsToDo: string[];
}

export interface State {
  id: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  cardImage: string;
  locations: Location[];
}

export const states: State[] = [
  {
    id: "sikkim",
    name: "Sikkim",
    tagline: "Where the Mountains Touch the Sky",
    description: "Nestled in the lap of the mighty Himalayas, Sikkim is a mystical land of Buddhist monasteries, pristine glacial lakes, and the majestic Kanchenjunga. Experience serenity like never before.",
    heroImage: "/src/assets/sikkim-hero.jpg",
    cardImage: "/src/assets/sikkim-hero.jpg",
    locations: [
      {
        id: "gangtok",
        name: "Gangtok",
        tagline: "The Gateway to Himalayan Dreams",
        description: "Perched at 5,410 feet, Gangtok offers a perfect blend of traditional Sikkimese culture and modern vibrancy. Wake up to views of Kanchenjunga and lose yourself in the warmth of Buddhist monasteries.",
        image: "/src/assets/gangtok.jpg",
        whyVisit: [
          "Breathtaking views of Kanchenjunga, the world's third-highest peak",
          "Rich Buddhist heritage with stunning monasteries",
          "Vibrant local markets with authentic handicrafts",
          "Gateway to explore North Sikkim's hidden treasures"
        ],
        bestTime: "March to June and September to December for clear skies and pleasant weather",
        topAttractions: [
          "Rumtek Monastery - The largest monastery in Sikkim",
          "MG Marg - The pedestrian-only heart of the city",
          "Tashi Viewpoint - Panoramic sunrise views",
          "Enchey Monastery - 200-year-old sacred site",
          "Hanuman Tok - Temple with stunning valley views"
        ],
        thingsToDo: [
          "Witness sunrise over Kanchenjunga from Tashi Viewpoint",
          "Explore the colorful MG Marg and try local momos",
          "Visit the serene Rumtek Monastery",
          "Cable car ride for aerial views of the city",
          "Trek to the nearby Himalayan trails"
        ]
      },
      {
        id: "tsomgo-lake",
        name: "Tsomgo Lake",
        tagline: "The Sacred Mirror of the Mountains",
        description: "At 12,400 feet, this sacred glacial lake changes colors with the seasons - from deep blue in summer to frozen white in winter. Surrounded by steep mountains and often enveloped in mystical mist.",
        image: "/src/assets/tsomgo-lake.jpg",
        whyVisit: [
          "One of the highest lakes in India",
          "Sacred site revered by locals",
          "Stunning color changes throughout the year",
          "Gateway to the Indo-China border at Nathu La"
        ],
        bestTime: "May to August to see the lake in its full glory; Winter for frozen lake views",
        topAttractions: [
          "The glacial lake itself - a photographer's paradise",
          "Yak rides along the lake shore",
          "Nathu La Pass - Just 16km away",
          "Prayer flags adorning the surroundings",
          "Local food stalls serving hot Thukpa and Momos"
        ],
        thingsToDo: [
          "Take a yak ride around the lake",
          "Photography during sunrise/sunset",
          "Visit during different seasons for varied experiences",
          "Explore the local mythology and folklore",
          "Continue to Nathu La if permits are available"
        ]
      },
      {
        id: "yumthang-valley",
        name: "Yumthang Valley",
        tagline: "The Valley of Flowers",
        description: "At 11,800 feet, Yumthang transforms into a magical carpet of rhododendrons from late February to June. This pristine valley is where nature paints with its most vibrant palette.",
        image: "/src/assets/yumthang-valley.jpg",
        whyVisit: [
          "Spectacular rhododendron blooms in spring",
          "Hot springs with therapeutic properties",
          "Untouched natural beauty away from crowds",
          "Gateway to Zero Point at 15,300 feet"
        ],
        bestTime: "Late February to June for rhododendron blooms; December-February for snow",
        topAttractions: [
          "Rhododendron sanctuary with 24 species",
          "Yumthang Hot Springs",
          "Zero Point - Where the road ends",
          "Shingba Rhododendron Sanctuary",
          "River Lachung flowing through the valley"
        ],
        thingsToDo: [
          "Walk through endless fields of blooming flowers",
          "Bathe in natural hot springs",
          "Drive to Zero Point for snow experiences",
          "Photography of the pristine landscape",
          "Picnic by the riverside"
        ]
      }
    ]
  },
  {
    id: "himachal-pradesh",
    name: "Himachal Pradesh",
    tagline: "Land of Gods and Endless Adventures",
    description: "From ancient temples to treacherous mountain passes, Himachal Pradesh offers every shade of the Himalayan experience. Find solace in its valleys and adventure in its peaks.",
    heroImage: "/src/assets/himachal-hero.jpg",
    cardImage: "/src/assets/himachal-hero.jpg",
    locations: [
      {
        id: "manali",
        name: "Manali",
        tagline: "Where Adventure Meets Serenity",
        description: "Cradled in the Kullu Valley at 6,726 feet, Manali is where rushing rivers meet snow-capped peaks. From ancient temples to thrilling adventures, it's a destination that captures every traveler's heart.",
        image: "/src/assets/manali.jpg",
        whyVisit: [
          "Perfect base for Himalayan adventures",
          "Blend of natural beauty and spiritual sites",
          "Gateway to Rohtang Pass and Leh",
          "Year-round destination with varied experiences"
        ],
        bestTime: "October to February for snow; March to June for pleasant weather and adventures",
        topAttractions: [
          "Rohtang Pass - Gateway to Lahaul Valley",
          "Hadimba Temple - Ancient wooden temple in cedar forest",
          "Solang Valley - Adventure sports hub",
          "Old Manali - Bohemian cafes and culture",
          "Jogini Waterfall - Scenic trek destination"
        ],
        thingsToDo: [
          "Paragliding in Solang Valley",
          "River rafting on Beas River",
          "Trek to Jogini Waterfall",
          "Explore the ancient Hadimba Temple",
          "Drive to Rohtang Pass for snow activities"
        ]
      },
      {
        id: "spiti-valley",
        name: "Spiti Valley",
        tagline: "The Middle Land Between Heaven and Earth",
        description: "At 12,500 feet, Spiti is a cold desert mountain valley - stark, barren, and hauntingly beautiful. Ancient monasteries perch on impossible cliffs, and time seems to have stood still for centuries.",
        image: "/src/assets/spiti-valley.jpg",
        whyVisit: [
          "One of the coldest inhabited places in India",
          "Ancient Buddhist monasteries over 1000 years old",
          "Stark, moon-like landscapes unlike anywhere else",
          "Authentic Tibetan culture and hospitality"
        ],
        bestTime: "June to September when roads are accessible; Winter for extreme adventurers only",
        topAttractions: [
          "Key Monastery - Largest monastery in Spiti",
          "Chandratal Lake - The Moon Lake",
          "Dhankar Monastery - Perched on a cliff",
          "Tabo Monastery - The Ajanta of the Himalayas",
          "Kunzum Pass - Gateway to Spiti"
        ],
        thingsToDo: [
          "Stay in a traditional Spitian homestay",
          "Star gazing in one of the clearest skies on Earth",
          "Visit the 1000-year-old Tabo Monastery",
          "Camp at the ethereal Chandratal Lake",
          "Drive through the highest villages in Asia"
        ]
      },
      {
        id: "dharamshala",
        name: "Dharamshala",
        tagline: "Home of the Dalai Lama",
        description: "Nestled in the Dhauladhar range, Dharamshala is where Tibetan spirituality meets Indian hospitality. McLeod Ganj, the little Lhasa of India, offers a unique blend of peace, culture, and mountain magic.",
        image: "/src/assets/dharamshala.jpg",
        whyVisit: [
          "Home of His Holiness the Dalai Lama",
          "Rich Tibetan culture and cuisine",
          "Spectacular Dhauladhar mountain views",
          "Perfect blend of spirituality and adventure"
        ],
        bestTime: "March to June and September to November for trekking and clear views",
        topAttractions: [
          "Tsuglagkhang Complex - Dalai Lama's residence",
          "Bhagsu Waterfall - Popular trek destination",
          "Triund Trek - Stunning overnight camping",
          "Tibet Museum - Documenting Tibetan history",
          "Norbulingka Institute - Tibetan art center"
        ],
        thingsToDo: [
          "Attend a teaching by the Dalai Lama",
          "Trek to Triund for camping under stars",
          "Learn about Tibetan culture at museums",
          "Sample authentic Tibetan food",
          "Practice meditation at Buddhist centers"
        ]
      }
    ]
  }
];

export const getStateById = (id: string): State | undefined => {
  return states.find(state => state.id === id);
};

export const getLocationById = (stateId: string, locationId: string): Location | undefined => {
  const state = getStateById(stateId);
  return state?.locations.find(location => location.id === locationId);
};
