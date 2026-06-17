// Detailed symptom list from Training.csv / Testing.csv standard Kaggle dataset
export const SYMPTOMS = [
  "itching",
  "skin_rash",
  "nodal_skin_eruptions",
  "continuous_sneezing",
  "shivering",
  "chills",
  "joint_pain",
  "stomach_pain",
  "acidity",
  "ulcers_on_tongue",
  "muscle_wasting",
  "vomiting",
  "burning_micturition",
  "spotting_ urination",
  "fatigue",
  "weight_gain",
  "anxiety",
  "cold_hands_and_feets",
  "mood_swings",
  "weight_loss",
  "restlessness",
  "lethargy",
  "patches_in_throat",
  "irregular_sugar_level",
  "cough",
  "high_fever",
  "sunken_eyes",
  "breathlessness",
  "sweating",
  "dehydration",
  "indigestion",
  "headache",
  "yellowish_skin",
  "dark_urine",
  "nausea",
  "loss_of_appetite",
  "pain_behind_the_eyes",
  "back_pain",
  "constipation",
  "abdominal_pain",
  "diarrhoea",
  "mild_fever",
  "yellow_urine",
  "yellowing_of_eyes",
  "acute_liver_failure",
  "fluid_overload",
  "swelling_of_stomach",
  "swelled_lymph_nodes",
  "malaise",
  "blurred_and_distorted_vision",
  "phlegm",
  "throat_irritation",
  "redness_of_eyes",
  "sinus_pressure",
  "runny_nose",
  "congestion",
  "chest_pain",
  "weakness_in_limbs",
  "fast_heart_rate",
  "pain_during_bowel_movements",
  "pain_in_anal_region",
  "bloody_stool",
  "irritation_in_anus",
  "neck_pain",
  "dizziness",
  "cramps",
  "bruising",
  "obesity",
  "swollen_legs",
  "swollen_blood_vessels",
  "puffy_face_and_eyes",
  "enlarged_thyroid",
  "brittle_nails",
  "swollen_extremeties",
  "excessive_hunger",
  "extra_marital_contacts",
  "drying_of_lips_and_throat",
  "continuous_feel_of_urine",
  "passage_of_gases",
  "internal_itching",
  "toxic_look_(typhoid)",
  "depression",
  "irritability",
  "muscle_pain",
  "altered_sensorium",
  "red_spots_over_body",
  "belly_pain",
  "abnormal_menstruation",
  "dischromic_patches",
  "watery_eyes",
  "increased_appetite",
  "polyuria",
  "family_history",
  "mucoid_sputum",
  "rusty_sputum",
  "lack_of_concentration",
  "visual_disturbances",
  "receiving_blood_transfusion",
  "receiving_unsterile_injections",
  "coma",
  "stomach_bleeding",
  "distention_of_abdomen",
  "history_of_alcohol_consumption",
  "blood_in_sputum",
  "prominent_veins_on_calf",
  "palpitations",
  "painful_walking",
  "pus_filled_pimples",
  "blackheads",
  "scurring",
  "skin_peeling",
  "silver_like_dusting",
  "small_dents_in_nails",
  "inflammatory_nails",
  "blister",
  "red_sore_around_nose",
  "yellow_crust_ooze"
];

export interface DiseaseInfo {
  disease: string;
  description: string;
  precautions: string[];
  recommendedSpecialist: string;
  category: string;
}

export const DISEASES_DATA: Record<string, DiseaseInfo> = {
  "Fungal infection": {
    disease: "Fungal infection",
    description: "A fungal infection (mycosis) is a skin disease caused by a fungus. There are millions of species of fungi. They live in the dirt, on plants, on household surfaces, and on your skin.",
    precautions: ["Bath twice daily", "Use dettol or antiseptic liquid", "Keep skin clean and dry", "Avoid shared towels"],
    recommendedSpecialist: "Dermatologist",
    category: "Skin Disease"
  },
  "Allergy": {
    disease: "Allergy",
    description: "An allergy is an immune system response to a foreign substance that's not typically harmful to your body. These foreign substances are called allergens.",
    precautions: ["Apply calamine lotion", "Take antihistamines", "Avoid allergens", "Keep indoor air clean"],
    recommendedSpecialist: "Allergist / Immunologist",
    category: "Immune System"
  },
  "GERD": {
    disease: "GERD",
    description: "Gastroesophageal reflux disease (GERD) is a chronic digestive disease in which stomach acid or, occasionally, stomach content, flows back into your food pipe (esophagus).",
    precautions: ["Avoid fatty & spicy foods", "Don't lie down right after meals", "Eat smaller portions", "Avoid late-night snacks"],
    recommendedSpecialist: "Gastroenterologist",
    category: "Digestive System"
  },
  "Chronic cholestasis": {
    disease: "Chronic cholestasis",
    description: "Cholestasis is a liver disease. It occurs when the flow of bile from your liver is reduced or blocked. Chronic cholestasis indicates a long-lasting, gradual blockage.",
    precautions: ["Avoid cold foods", "Consult doctor immediately", "Eat a low-fat diet", "Drink plenty of water"],
    recommendedSpecialist: "Hepatologist",
    category: "Liver Disease"
  },
  "Drug Reaction": {
    disease: "Drug Reaction",
    description: "A drug reaction is an adverse effect from a pharmaceutical drug. It can range from mild rashes to life-threatening emergencies.",
    precautions: ["Stop taking current pills", "Consult doctor", "Monitor for breathing issues", "Stay hydrated"],
    recommendedSpecialist: "Allergist / Dermatologist",
    category: "Immune System / Skin"
  },
  "Peptic ulcer disease": {
    disease: "Peptic ulcer disease",
    description: "Peptic ulcers are open sores that develop on the inside lining of your stomach and the upper part of your small intestine.",
    precautions: ["Avoid spicy food", "Limit caffeine & alcohol", "Don't smoke", "Consume probiotic foods"],
    recommendedSpecialist: "Gastroenterologist",
    category: "Digestive System"
  },
  "AIDS": {
    disease: "AIDS",
    description: "Acquired immunodeficiency syndrome (AIDS) is a chronic, potentially life-threatening condition caused by the human immunodeficiency virus (HIV).",
    precautions: ["Use protective measures", "Avoid sharing needles", "Consult doctor regularly", "Follow antiretroviral therapy"],
    recommendedSpecialist: "Infectious Disease Specialist",
    category: "Viral Infection"
  },
  "Diabetes": {
    disease: "Diabetes",
    description: "Diabetes mellitus refers to a group of diseases that affect how your body uses blood sugar (glucose). Glucose is vital to your health because it's an important source of energy.",
    precautions: ["Limit sugary foods", "Exercise regularly", "Monitor blood glucose levels", "Consult a doctor"],
    recommendedSpecialist: "Endocrinologist",
    category: "Endocrine System"
  },
  "Gastroenteritis": {
    disease: "Gastroenteritis",
    description: "Gastroenteritis is an inflammation of the lining of the intestines caused by a virus, bacteria, or parasites.",
    precautions: ["Drink plenty of oral rehydration fluids", "Eat bland foods like bananas", "Wash hands frequently", "Avoid dairy products"],
    recommendedSpecialist: "Gastroenterologist",
    category: "Digestive System"
  },
  "Bronchial Asthma": {
    disease: "Bronchial Asthma",
    description: "Asthma is a condition in which your airways narrow and swell and may produce extra mucus. This can make breathing difficult and trigger coughing, a whistling sound (wheezing) when you breathe out.",
    precautions: ["Use inhaler as prescribed", "Avoid dust and smoke", "Keep home clean", "Stay warm during cold weather"],
    recommendedSpecialist: "Pulmonologist",
    category: "Respiratory System"
  },
  "Hypertension": {
    disease: "Hypertension",
    description: "High blood pressure (hypertension) is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.",
    precautions: ["Reduce salt consumption", "Exercise daily", "Manage stress", "Avoid smoking & alcohol"],
    recommendedSpecialist: "Cardiologist",
    category: "Cardiovascular System"
  },
  "Migraine": {
    disease: "Migraine",
    description: "A migraine is a headache that can cause severe throbbing pain or a pulsing sensation, usually on one side of the head. It's often accompanied by nausea, vomiting, and extreme sensitivity to light and sound.",
    precautions: ["Rest in a quiet, dark room", "Apply cold compress to forehead", "Avoid food triggers", "Maintain consistent sleep cycle"],
    recommendedSpecialist: "Neurologist",
    category: "Neurological"
  },
  "Cervical spondylosis": {
    disease: "Cervical spondylosis",
    description: "Cervical spondylosis is a general term for age-related wear and tear affecting the spinal disks in your neck.",
    precautions: ["Use a supportive neck pillow", "Avoid heavy lifting", "Perform gentle neck exercises", "Apply hot or cold compress"],
    recommendedSpecialist: "Orthopedic Surgeon / Physiotherapist",
    category: "Bone & Joint"
  },
  "Paralysis (brain hemorrhage)": {
    disease: "Paralysis (brain hemorrhage)",
    description: "Brain hemorrhage causes a stroke, which occurs when an artery in the brain bursts and causes localized bleeding in the surrounding tissues, leading to brain cell death and motor paralysis.",
    precautions: ["Immediate emergency medical care", "Strict blood pressure monitoring", "Avoid sudden exertion", "Quit smoking and alcohol"],
    recommendedSpecialist: "Neurologist / Neurosurgeon",
    category: "Neurological"
  },
  "Jaundice": {
    disease: "Jaundice",
    description: "Jaundice is a condition in which the skin, sclera (whites of the eyes) and mucous membranes turn yellow due to high levels of bilirubin, a yellow-orange bile pigment.",
    precautions: ["Drink pure boiled water", "Avoid oily & fatty foods", "Eat fresh fruits and vegetables", "Consult general physician"],
    recommendedSpecialist: "Gastroenterologist / Hepatologist",
    category: "Liver Disease"
  },
  "Malaria": {
    disease: "Malaria",
    description: "Malaria is a disease caused by a plasmodium parasite, transmitted by the bite of infected mosquitoes.",
    precautions: ["Avoid mosquito bites by using repellent", "Use mosquito nets", "Consult doctor for anti-malarial medication", "Keep surrounding water drained"],
    recommendedSpecialist: "Infectious Disease Specialist",
    category: "Parasitic Infection"
  },
  "Chicken pox": {
    disease: "Chicken pox",
    description: "Chickenpox is a highly contagious disease caused by the varicella-zoster virus (VZV). It causes an itchy, blister-like rash, which eventually turns into scabs.",
    precautions: ["Isolate the patient", "Keep nails trimmed to prevent scratching", "Use calamine lotion", "Stay hydrated"],
    recommendedSpecialist: "General Physician / Dermatologist",
    category: "Viral Infection"
  },
  "Dengue": {
    disease: "Dengue",
    description: "Dengue fever is a mosquito-borne illness that occurs in tropical and subtropical areas of the world. Mild dengue fever causes a high fever and flu-like symptoms.",
    precautions: ["Drink plenty of fluids & coconut water", "Monitor platelet counts", "Use mosquito nets", "Avoid self-medication of aspirin/ibuprofen"],
    recommendedSpecialist: "Infectious Disease Specialist",
    category: "Viral Infection"
  },
  "Typhoid": {
    disease: "Typhoid",
    description: "Typhoid fever is an infection caused by Salmonella typhimurium bacteria. It is contracted by drinking or eating food or water contaminated with infected fluids or feces.",
    precautions: ["Drink clean, boiled water", "Eat fully cooked hot foods", "Wash hands regularly", "Avoid ice and street foods"],
    recommendedSpecialist: "Infectious Disease Specialist",
    category: "Bacterial Infection"
  },
  "Hepatitis A": {
    disease: "Hepatitis A",
    description: "Hepatitis A is a highly contagious liver infection caused by the hepatitis A virus. It can be spread by eating or drinking containing fecal virus particles.",
    precautions: ["Avoid alcohol and drug triggers", "Drink boiled water", "Thoroughly wash food", "Get vaccinated"],
    recommendedSpecialist: "Hepatologist / Gastroenterologist",
    category: "Liver Disease"
  },
  "Hepatitis B": {
    disease: "Hepatitis B",
    description: "Hepatitis B is a serious liver infection caused by the hepatitis B virus (HBV). For some people, hepatitis B infection becomes chronic, leading to liver failure, liver cancer or cirrhosis.",
    precautions: ["Avoid sharing blades or syringes", "Practice safe sexual practices", "Get hepatitis B vaccination", "Consult Hepatologist"],
    recommendedSpecialist: "Hepatologist / Gastroenterologist",
    category: "Liver Disease"
  },
  "Hepatitis C": {
    disease: "Hepatitis C",
    description: "Hepatitis C is an infection caused by the hepatitis C virus (HCV) that attacks the liver and leads to inflammation.",
    precautions: ["Avoid sharing needles & hygiene gear", "Practice safe intimacy", "Seek antiviral medication", "Regular liver monitoring"],
    recommendedSpecialist: "Hepatologist / Gastroenterologist",
    category: "Liver Disease"
  },
  "Hepatitis D": {
    disease: "Hepatitis D",
    description: "Hepatitis D, also known as hepatitis delta, is an infection that causes inflammation of the liver, and occurs only in people who are already infected with the hepatitis B virus.",
    precautions: ["Get vaccinated against Hepatitis B", "Practice clean habits", "Monitor liver health strictly", "Consult specialist"],
    recommendedSpecialist: "Hepatologist / Gastroenterologist",
    category: "Liver Disease"
  },
  "Hepatitis E": {
    disease: "Hepatitis E",
    description: "Hepatitis E is a liver disease caused by the hepatitis E virus (HEV). It is mainly transmitted through contaminated drinking water.",
    precautions: ["Drink clean filtered/boiled water", "Cook meat thoroughly", "Practice top sanitation", "Avoid cold unwashed food"],
    recommendedSpecialist: "Hepatologist / Gastroenterologist",
    category: "Liver Disease"
  },
  "Alcoholic hepatitis": {
    disease: "Alcoholic hepatitis",
    description: "Alcoholic hepatitis is inflammation of the liver caused by drinking alcohol. It's most likely to occur in people who drink heavily over many years.",
    precautions: ["Complete cessation of alcohol usage", "Eat healthy high-protein snacks", "Consult liver specialist", "Regular abdominal scans"],
    recommendedSpecialist: "Hepatologist / Gastroenterologist",
    category: "Liver Disease"
  },
  "Tuberculosis": {
    disease: "Tuberculosis",
    description: "Tuberculosis (TB) is a potentially serious infectious disease that mainly affects your lungs. The bacteria that cause tuberculosis are spread from one person to another through tiny droplets released into the air.",
    precautions: ["Wear a face mask", "Complete full course of DOTS therapy", "Ensure room is well ventilated", "Avoid close public contact"],
    recommendedSpecialist: "Pulmonologist / Infectious Disease Expert",
    category: "Respiratory Infection"
  },
  "Common Cold": {
    disease: "Common Cold",
    description: "The common cold is a viral infection of your nose and throat (upper respiratory tract). It's usually harmless, although it might not feel that way.",
    precautions: ["Stay warm", "Steam inhalation", "Drink warm salt water gargles", "Stay well hydrated"],
    recommendedSpecialist: "General Physician",
    category: "Respiratory Infection"
  },
  "Pneumonia": {
    disease: "Pneumonia",
    description: "Pneumonia is an infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm or pus, fever, chills, and difficulty breathing.",
    precautions: ["Keep warm and rested", "Consult pulmonologist ASAP for antibiotics", "Steam inhalation", "Monitor oxygen saturation"],
    recommendedSpecialist: "Pulmonologist / General Physician",
    category: "Respiratory Infection"
  },
  "Dimorphic hemorrhoids(piles)": {
    disease: "Dimorphic hemorrhoids(piles)",
    description: "Hemorrhoids, also called piles, are swollen veins in your anus and lower rectum, similar to varicose veins. They can develop inside the rectum or under the skin around the anus.",
    precautions: ["Eat extra fiber-rich foods", "Avoid straining during bowel movements", "Take warm sitz baths", "Drink abundant water"],
    recommendedSpecialist: "Proctologist / General Surgeon",
    category: "Gastrointestinal"
  },
  "Heart attack": {
    disease: "Heart attack",
    description: "A heart attack occurs when the flow of blood to the heart is severely reduced or blocked. The blockage is usually due to a buildup of fat, cholesterol and other substances in the heart (coronary) arteries.",
    precautions: ["Call medical emergency services immediately", "Take dispersible aspirin if advised", "Sit comfortably & stay calm", "Immediate hospital visit"],
    recommendedSpecialist: "Cardiologist",
    category: "Cardiovascular System"
  },
  "Varicose veins": {
    disease: "Varicose veins",
    description: "Varicose veins are twisted, enlarged veins. Any vein that is close to the skin's surface can become varicosed. Varicose veins most commonly affect the veins in the legs.",
    precautions: ["Wear compression stockings", "Elevate legs when resting", "Avoid long periods of sitting or standing", "Exercise daily"],
    recommendedSpecialist: "Vascular Surgeon",
    category: "Circulatory System"
  },
  "Hypothyroidism": {
    disease: "Hypothyroidism",
    description: "Hypothyroidism (underactive thyroid) is a condition in which your thyroid gland doesn't produce enough of certain crucial hormones.",
    precautions: ["Take thyroid hormone replacement pills", "Maintain list of symptoms", "Consult Endocrinologist régulièrement", "Reduce processed foods count"],
    recommendedSpecialist: "Endocrinologist",
    category: "Endocrine System"
  },
  "Hyperthyroidism": {
    disease: "Hyperthyroidism",
    description: "Hyperthyroidism (overactive thyroid) occurs when your thyroid gland produces too much of the hormone thyroxine. Hyperthyroidism can accelerate your body's metabolism.",
    precautions: ["Consult endocrinologist", "Take anti-thyroid pills", "Regular thyroid panel tests", "Reduce excess iodine in diet"],
    recommendedSpecialist: "Endocrinologist",
    category: "Endocrine System"
  },
  "Hypoglycemia": {
    disease: "Hypoglycemia",
    description: "Hypoglycemia is a condition in which your blood sugar (glucose) level is lower than the standard range. Glucose is your body's main energy source.",
    precautions: ["Eat simple carbohydrates / glucose immediately", "Monitor sugar levels", "Don't skip key meals", "Keep glucose candies handy"],
    recommendedSpecialist: "Endocrinologist / General Physician",
    category: "Endocrine System"
  },
  "Osteoarthristis": {
    disease: "Osteoarthristis",
    description: "Osteoarthritis is the most common form of arthritis, affecting millions of people worldwide. It occurs when the protective cartilage that cushions the ends of the bones wears down over time.",
    precautions: ["Gentle physical therapy", "Maintain a healthy weight", "Apply warm heating pads", "Use comfortable joint supports"],
    recommendedSpecialist: "Rheumatologist / Orthopedic Expert",
    category: "Bone & Joint"
  },
  "Arthritis": {
    disease: "Arthritis",
    description: "Arthritis is the swelling and tenderness of one or more joints. The main symptoms of arthritis are joint pain and stiffness, which typically worsen with age.",
    precautions: ["Keep joints warm", "Regular low-impact exercise", "Consume anti-inflammatory diet", "Consult Rheumatologist"],
    recommendedSpecialist: "Rheumatologist",
    category: "Bone & Joint"
  },
  "(vertigo) Paroymsal Positional Vertigo": {
    disease: "(vertigo) Paroymsal Positional Vertigo",
    description: "Benign paroxysmal positional vertigo (BPPV) is one of the most common causes of vertigo — the sudden sensation that you're spinning or that the inside of your head is spinning.",
    precautions: ["Avoid sudden neck movements", "Perform canalith repositioning manoeuvres", "Lie flat during severe episodes", "Stay hydrated"],
    recommendedSpecialist: "ENT Specialist / Neurologist",
    category: "Vestibular System"
  },
  "Acne": {
    disease: "Acne",
    description: "Acne is a skin condition that occurs when your hair follicles become plugged with oil and dead skin cells. It causes whiteheads, blackheads or pimples.",
    precautions: ["Avoid popping pimples", "Wash face twice daily with mild wash", "Use non-comedogenic skin products", "Keep hair clean and off face"],
    recommendedSpecialist: "Dermatologist",
    category: "Skin Disease"
  },
  "Urinary tract infection": {
    disease: "Urinary tract infection",
    description: "A urinary tract infection (UTI) is an infection in any part of your urinary system — your kidneys, ureters, bladder and urethra. Most infections involve the lower urinary tract — the bladder and the urethra.",
    precautions: ["Drink plenty of water", "Cranberry juice can help", "Maintain high personal hygiene", "Consult doctor for antibiotics"],
    recommendedSpecialist: "Urologist / General Physician",
    category: "Urinary System"
  },
  "Psoriasis": {
    disease: "Psoriasis",
    description: "Psoriasis is a skin disease that causes dry, red, itchy scaly patches, most commonly on the knees, elbows, trunk and scalp.",
    precautions: ["Use protective medical moisturizers", "Apply mild sunlight", "Avoid stress or skin trauma", "Consult Dermatologist regularly"],
    recommendedSpecialist: "Dermatologist / Rheumatologist",
    category: "Skin & Immune"
  },
  "Impetigo": {
    disease: "Impetigo",
    description: "Impetigo is a highly contagious skin infection that mainly affects infants and young children. It usually appears as reddish sores on the face, especially around the nose and mouth.",
    precautions: ["Wash sores with soap and warm water", "Avoid sharing personal wash accessories", "Keep nails cut short", "Apply antibiotic creams prescribed"],
    recommendedSpecialist: "Dermatologist / Pediatrician",
    category: "Skin Infection"
  }
};
