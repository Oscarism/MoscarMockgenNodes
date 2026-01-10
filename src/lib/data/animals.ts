// ============================================
// Animals / Pets Presets
// ============================================

export interface AnimalPreset {
	id: string;
	label: string;
	prompt: string;
}

// Species
export const animalSpecies: AnimalPreset[] = [
	{ id: 'dog', label: 'Dog', prompt: 'dog, canine' },
	{ id: 'cat', label: 'Cat', prompt: 'cat, feline' },
	{ id: 'bird', label: 'Bird', prompt: 'bird, avian' },
	{ id: 'horse', label: 'Horse', prompt: 'horse, equine' },
	{ id: 'rabbit', label: 'Rabbit', prompt: 'rabbit, bunny' },
	{ id: 'hamster', label: 'Hamster', prompt: 'hamster, small rodent' },
	{ id: 'guinea-pig', label: 'Guinea Pig', prompt: 'guinea pig, cavy' },
	{ id: 'fish', label: 'Fish', prompt: 'fish, aquatic' },
	{ id: 'reptile', label: 'Reptile', prompt: 'reptile, scaled' },
	{ id: 'turtle', label: 'Turtle/Tortoise', prompt: 'turtle, tortoise, shelled reptile' },
	{ id: 'snake', label: 'Snake', prompt: 'snake, serpent' },
	{ id: 'parrot', label: 'Parrot', prompt: 'parrot, colorful bird, tropical bird' },
	{ id: 'wildlife', label: 'Wildlife', prompt: 'wild animal, nature wildlife' },
	{ id: 'exotic', label: 'Exotic Pet', prompt: 'exotic pet, unusual animal' }
];

// Dog Breeds
export const dogBreeds: AnimalPreset[] = [
	{ id: 'golden-retriever', label: 'Golden Retriever', prompt: 'golden retriever, friendly golden dog' },
	{ id: 'labrador', label: 'Labrador', prompt: 'labrador retriever, lab dog' },
	{ id: 'german-shepherd', label: 'German Shepherd', prompt: 'german shepherd, alsatian dog' },
	{ id: 'french-bulldog', label: 'French Bulldog', prompt: 'french bulldog, frenchie' },
	{ id: 'bulldog', label: 'Bulldog', prompt: 'english bulldog, stocky bulldog' },
	{ id: 'poodle', label: 'Poodle', prompt: 'poodle, curly coated dog' },
	{ id: 'beagle', label: 'Beagle', prompt: 'beagle, hound dog' },
	{ id: 'husky', label: 'Husky', prompt: 'siberian husky, blue-eyed husky' },
	{ id: 'corgi', label: 'Corgi', prompt: 'welsh corgi, short-legged corgi' },
	{ id: 'dachshund', label: 'Dachshund', prompt: 'dachshund, wiener dog, sausage dog' },
	{ id: 'shiba-inu', label: 'Shiba Inu', prompt: 'shiba inu, japanese dog' },
	{ id: 'pomeranian', label: 'Pomeranian', prompt: 'pomeranian, fluffy small dog' },
	{ id: 'chihuahua', label: 'Chihuahua', prompt: 'chihuahua, tiny dog' },
	{ id: 'mixed', label: 'Mixed Breed', prompt: 'mixed breed dog, mutt, unique dog' }
];

// Cat Breeds
export const catBreeds: AnimalPreset[] = [
	{ id: 'persian', label: 'Persian', prompt: 'persian cat, fluffy flat-faced cat' },
	{ id: 'siamese', label: 'Siamese', prompt: 'siamese cat, pointed coloring, blue eyes' },
	{ id: 'maine-coon', label: 'Maine Coon', prompt: 'maine coon, large fluffy cat' },
	{ id: 'british-shorthair', label: 'British Shorthair', prompt: 'british shorthair, chunky round cat' },
	{ id: 'ragdoll', label: 'Ragdoll', prompt: 'ragdoll cat, floppy docile cat' },
	{ id: 'bengal', label: 'Bengal', prompt: 'bengal cat, spotted wild-looking cat' },
	{ id: 'scottish-fold', label: 'Scottish Fold', prompt: 'scottish fold, folded ear cat' },
	{ id: 'sphynx', label: 'Sphynx', prompt: 'sphynx cat, hairless cat' },
	{ id: 'tabby', label: 'Tabby', prompt: 'tabby cat, striped pattern cat' },
	{ id: 'tuxedo', label: 'Tuxedo', prompt: 'tuxedo cat, black and white cat' },
	{ id: 'orange-tabby', label: 'Orange Tabby', prompt: 'orange tabby, ginger cat' },
	{ id: 'calico', label: 'Calico', prompt: 'calico cat, tri-color patches' }
];

// Age
export const animalAges: AnimalPreset[] = [
	{ id: 'baby', label: 'Baby/Newborn', prompt: 'baby animal, newborn, very young, tiny' },
	{ id: 'young', label: 'Puppy/Kitten', prompt: 'young animal, puppy, kitten, juvenile, playful youth' },
	{ id: 'adolescent', label: 'Adolescent', prompt: 'adolescent animal, young adult, growing' },
	{ id: 'adult', label: 'Adult', prompt: 'adult animal, fully grown, mature' },
	{ id: 'senior', label: 'Senior', prompt: 'senior animal, older, wise, gray muzzle' }
];

// Behavior & Pose
export const animalBehaviors: AnimalPreset[] = [
	{ id: 'sitting', label: 'Sitting', prompt: 'sitting, seated pose, attentive' },
	{ id: 'standing', label: 'Standing', prompt: 'standing, upright, alert stance' },
	{ id: 'lying', label: 'Lying Down', prompt: 'lying down, relaxed, resting position' },
	{ id: 'running', label: 'Running', prompt: 'running, in motion, dynamic movement, action shot' },
	{ id: 'jumping', label: 'Jumping', prompt: 'jumping, leaping, mid-air, athletic' },
	{ id: 'playing', label: 'Playing', prompt: 'playing, playful, having fun, energetic' },
	{ id: 'sleeping', label: 'Sleeping', prompt: 'sleeping, napping, peaceful, eyes closed, dreaming' },
	{ id: 'eating', label: 'Eating', prompt: 'eating, feeding, enjoying food' },
	{ id: 'alert', label: 'Alert/Attentive', prompt: 'alert, attentive, ears perked, focused' },
	{ id: 'curious', label: 'Curious', prompt: 'curious, investigating, head tilted, interested' },
	{ id: 'cuddling', label: 'Cuddling', prompt: 'cuddling, snuggling, affectionate, cozy' },
	{ id: 'grooming', label: 'Grooming', prompt: 'grooming, cleaning, self-care' },
	{ id: 'begging', label: 'Begging', prompt: 'begging, pleading eyes, wanting treat' },
	{ id: 'fetching', label: 'Fetching', prompt: 'fetching, carrying toy, retrieval' }
];

// Coat Color
export const coatColors: AnimalPreset[] = [
	{ id: 'white', label: 'White', prompt: 'white coat, pure white fur' },
	{ id: 'black', label: 'Black', prompt: 'black coat, dark black fur' },
	{ id: 'brown', label: 'Brown', prompt: 'brown coat, chocolate brown fur' },
	{ id: 'golden', label: 'Golden/Tan', prompt: 'golden coat, tan fur, honey colored' },
	{ id: 'gray', label: 'Gray', prompt: 'gray coat, silver fur' },
	{ id: 'cream', label: 'Cream', prompt: 'cream coat, off-white fur' },
	{ id: 'red', label: 'Red/Ginger', prompt: 'red coat, ginger fur, orange' },
	{ id: 'brindle', label: 'Brindle', prompt: 'brindle coat, striped pattern, tiger-striped' },
	{ id: 'spotted', label: 'Spotted', prompt: 'spotted coat, spots, dalmatian-like' },
	{ id: 'merle', label: 'Merle', prompt: 'merle coat, mottled pattern, marbled' },
	{ id: 'bi-color', label: 'Bi-Color', prompt: 'bi-color coat, two-tone, patched' },
	{ id: 'tri-color', label: 'Tri-Color', prompt: 'tri-color coat, three colors, varied markings' }
];

// Coat Type
export const coatTypes: AnimalPreset[] = [
	{ id: 'short', label: 'Short Hair', prompt: 'short hair coat, smooth fur, sleek' },
	{ id: 'long', label: 'Long Hair', prompt: 'long hair coat, flowing fur, luxurious' },
	{ id: 'medium', label: 'Medium Hair', prompt: 'medium length coat, moderate fur' },
	{ id: 'curly', label: 'Curly', prompt: 'curly coat, wavy fur, textured' },
	{ id: 'wire', label: 'Wire Hair', prompt: 'wire hair coat, rough texture, bristly' },
	{ id: 'fluffy', label: 'Fluffy', prompt: 'fluffy coat, puffy fur, cloud-like' },
	{ id: 'silky', label: 'Silky', prompt: 'silky coat, smooth glossy fur, shiny' },
	{ id: 'double', label: 'Double Coat', prompt: 'double coat, thick undercoat, plush' },
	{ id: 'hairless', label: 'Hairless', prompt: 'hairless, no fur, smooth skin' }
];

// Pet Accessories
export const petAccessories: AnimalPreset[] = [
	{ id: 'collar', label: 'Collar', prompt: 'wearing collar, pet collar, neck band' },
	{ id: 'bow-tie', label: 'Bow Tie', prompt: 'wearing bow tie, dapper, dressed up' },
	{ id: 'bandana', label: 'Bandana', prompt: 'wearing bandana, neck scarf, styled' },
	{ id: 'sweater', label: 'Sweater/Clothing', prompt: 'wearing pet sweater, pet clothing, dressed' },
	{ id: 'harness', label: 'Harness', prompt: 'wearing harness, pet harness, walking gear' },
	{ id: 'leash', label: 'On Leash', prompt: 'on leash, being walked, leashed' },
	{ id: 'toy', label: 'With Toy', prompt: 'with pet toy, playing with toy, holding toy' },
	{ id: 'bed', label: 'In Pet Bed', prompt: 'in pet bed, cozy bed, comfortable' },
	{ id: 'costume', label: 'Crown/Costume', prompt: 'wearing crown, pet costume, playful dress-up' }
];
