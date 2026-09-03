import 'dotenv/config';
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import VehicleSchema from './apps/vmotors-api/src/schemas/Vehicle.model';

// ⚙️ SETTINGS
// Set to true to delete all existing vehicles and reseed from scratch
const CLEAR_EXISTING = false;

// Folder where the images live (stored in DB as "uploads/vehicle/...")
const VEHICLE_DIR = path.join(__dirname, 'uploads', 'vehicle');

// 🚗 Specs for each model. Key = the image filename prefix.
// Prices are approximate for the Korean market, in KRW (won). Feel free to change anything.
const META: Record<string, any> = {
	// ---- HYUNDAI ----
	'hyundai-avante':   { brand: 'HYUNDAI', model: 'Avante',   trim: '1.6 Smartstream Modern', year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Cyber Gray',     price: 19900000, bodyType: 'Compact Sedan',      mileage: 8500,  desc: 'The all-new Hyundai Avante — a fuel-efficient and modern compact sedan.' },
	'hyundai-elantra':  { brand: 'HYUNDAI', model: 'Elantra',  trim: '1.6 Premium',           year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Phantom Black',  price: 22500000, bodyType: 'Compact Sedan',      mileage: 5200,  desc: 'Hyundai Elantra — a sporty, sharp-looking family sedan.' },
	'hyundai-sonata':   { brand: 'HYUNDAI', model: 'Sonata',   trim: '2.0 Premium',           year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Nocturne Gray',  price: 28000000, bodyType: 'Midsize Sedan',      mileage: 12000, desc: 'Hyundai Sonata — a spacious and comfortable mid-size sedan.' },
	'hyundai-grandeur': { brand: 'HYUNDAI', model: 'Grandeur', trim: '3.5 Calligraphy',       year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Creamy White',   price: 43000000, bodyType: 'Full-size Sedan',    mileage: 3100,  desc: 'Hyundai Grandeur — the flagship full-size luxury sedan.' },
	'hyundai-tucson':   { brand: 'HYUNDAI', model: 'Tucson',   trim: '1.6T Inspiration',      year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Amazon Gray',    price: 32000000, bodyType: 'Compact SUV',        mileage: 9800,  desc: 'Hyundai Tucson — a versatile compact SUV for everyday driving.' },
	'hyundai-santafe':  { brand: 'HYUNDAI', model: 'Santa Fe', trim: '2.5T Calligraphy',      year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Pebble Blue',    price: 42000000, bodyType: 'Midsize SUV',        mileage: 7400,  desc: 'Hyundai Santa Fe — a roomy mid-size family SUV.' },
	'hyundai-staria':   { brand: 'HYUNDAI', model: 'Staria',   trim: '2.2 Diesel Lounge',     year: 2025, fuel: 'DIESEL',   transmission: 'AUTOMATIC', color: 'Graphite Gray',  price: 38000000, bodyType: 'Minivan',            mileage: 15600, desc: 'Hyundai Staria — a futuristic 9 to 11-seater minivan.' },
	'hyundai-casper':   { brand: 'HYUNDAI', model: 'Casper',   trim: '1.0 Modern',            year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Dusk Blue',      price: 14000000, bodyType: 'Mini SUV',           mileage: 2300,  desc: 'Hyundai Casper — a compact mini SUV built for the city.' },
	'hyundai-ioniq5':   { brand: 'HYUNDAI', model: 'Ioniq 5',  trim: 'Long Range AWD',        year: 2025, fuel: 'ELECTRIC', transmission: 'AUTOMATIC', color: 'Gravity Gold',   price: 52000000, bodyType: 'Electric Crossover', mileage: 6700,  desc: 'Hyundai Ioniq 5 — an electric crossover with 800V ultra-fast charging.' },
	'hyundai-ioniq6':   { brand: 'HYUNDAI', model: 'Ioniq 6',  trim: 'Long Range RWD',        year: 2025, fuel: 'ELECTRIC', transmission: 'AUTOMATIC', color: 'Serenity White', price: 55000000, bodyType: 'Electric Sedan',     mileage: 4100,  desc: 'Hyundai Ioniq 6 — an aerodynamic, long-range electric sedan.' },

	// ---- KIA ----
	'kia-morning':  { brand: 'KIA', model: 'Morning',  trim: '1.0 Signature',        year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Milky Beige',        price: 13500000, bodyType: 'City Car',           mileage: 11200, desc: 'Kia Morning — the most economical city car.' },
	'kia-ray':      { brand: 'KIA', model: 'Ray',      trim: '1.0 Signature',        year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Smart Yellow',       price: 14500000, bodyType: 'Mini MPV',           mileage: 9300,  desc: 'Kia Ray — a box-shaped mini car with a spacious interior.' },
	'kia-seltos':   { brand: 'KIA', model: 'Seltos',   trim: '1.6 Signature',        year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Mars Orange',        price: 24000000, bodyType: 'Subcompact SUV',     mileage: 6900,  desc: 'Kia Seltos — a youthful subcompact SUV.' },
	'kia-k5':       { brand: 'KIA', model: 'K5',       trim: '1.6T Noblesse',        year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Snow White Pearl',   price: 27000000, bodyType: 'Midsize Sedan',      mileage: 10500, desc: 'Kia K5 — a mid-size sedan with a sporty design.' },
	'kia-k8':       { brand: 'KIA', model: 'K8',       trim: '3.5 Signature',        year: 2025, fuel: 'GASOLINE', transmission: 'AUTOMATIC', color: 'Moonscape Gray',     price: 38000000, bodyType: 'Full-size Sedan',    mileage: 4800,  desc: 'Kia K8 — a luxurious full-size sedan.' },
	'kia-sorento':  { brand: 'KIA', model: 'Sorento',  trim: '2.2 Diesel Signature', year: 2025, fuel: 'DIESEL',   transmission: 'AUTOMATIC', color: 'Aurora Black',       price: 38000000, bodyType: 'Midsize SUV',        mileage: 13400, desc: 'Kia Sorento — a mid-size family SUV.' },
	'kia-carnival': { brand: 'KIA', model: 'Carnival', trim: '2.2 Diesel Signature', year: 2025, fuel: 'DIESEL',   transmission: 'AUTOMATIC', color: 'Glacier White',      price: 42000000, bodyType: 'Minivan',            mileage: 16800, desc: 'Kia Carnival — a premium large minivan.' },
	'kia-ev6':      { brand: 'KIA', model: 'EV6',      trim: 'Long Range GT-Line',   year: 2025, fuel: 'ELECTRIC', transmission: 'AUTOMATIC', color: 'Runway Red',         price: 52000000, bodyType: 'Electric Crossover', mileage: 7200,  desc: 'Kia EV6 — a high-performance electric crossover.' },
	'kia-ev9':      { brand: 'KIA', model: 'EV9',      trim: 'Earth AWD',            year: 2025, fuel: 'ELECTRIC', transmission: 'AUTOMATIC', color: 'Ocean Blue',         price: 78000000, bodyType: 'Electric SUV',       mileage: 3600,  desc: 'Kia EV9 — a large three-row electric SUV.' },
};

// Extracts the model prefix from a filename: "hyundai-avante-01.jpg" -> "hyundai-avante"
function prefixOf(filename: string): string | null {
	const m = filename.match(/^(.*)-\d{2}\.[a-z0-9]+$/i);
	return m ? m[1] : null;
}

async function seed() {
	const uri = process.env.MONGO_DEV;
	if (!uri) throw new Error('MONGO_DEV not found in .env');

	await mongoose.connect(uri);
	console.log('✅ Connected to the database');

	const VehicleModel = mongoose.model('Vehicle', VehicleSchema);
	const members = mongoose.connection.collection('members');

	// 1) Find an AGENT (dealer) — they become the owner of every vehicle
	const agent = await members.findOne({ memberType: 'AGENT' });
	if (!agent) throw new Error('No AGENT found! Create a dealer account first.');
	console.log(`👤 Dealer: ${agent.memberNick} (${agent._id})`);

	// 2) Check for existing vehicles
	const existing = await VehicleModel.countDocuments();
	if (existing > 0) {
		if (!CLEAR_EXISTING) {
			// Backfill new spec fields in place instead of reseeding — keeps _ids, likes, and comments intact
			console.log(`♻️  ${existing} vehicles already exist — backfilling bodyType/mileage instead of reseeding.`);
			for (const meta of Object.values(META)) {
				const res = await VehicleModel.updateMany(
					{ vehicleBrand: meta.brand, vehicleModel: meta.model },
					{ $set: { vehicleBodyType: meta.bodyType, vehicleMileage: meta.mileage } },
				);
				if (res.modifiedCount > 0) console.log(`   ✔ ${meta.brand} ${meta.model}: ${res.modifiedCount} updated`);
			}
			await mongoose.disconnect();
			console.log('🎉 Backfill done!');
			return;
		}
		await VehicleModel.deleteMany({});
		console.log(`🗑️  Deleted ${existing} old vehicles`);
	}

	// 3) Read the images from the folder and group them by model
	const files = fs.readdirSync(VEHICLE_DIR).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
	const grouped: Record<string, string[]> = {};
	for (const f of files) {
		const key = prefixOf(f);
		if (!key) continue;
		(grouped[key] ??= []).push(f);
	}

	// 4) Build a document for each model
	const docs: any[] = [];
	for (const [key, imgs] of Object.entries(grouped)) {
		const meta = META[key];
		if (!meta) {
			console.log(`⏭️  No spec for "${key}" — skipped`);
			continue;
		}
		// sort the images by their number (01, 02, 03, 04)
		const sorted = imgs.sort();
		docs.push({
			vehicleBrand: meta.brand,
			vehicleModel: meta.model,
			vehicleTrim: meta.trim,
			vehicleYear: meta.year,
			vehicleFuel: meta.fuel,
			vehicleTransmission: meta.transmission,
			vehicleColor: meta.color,
			vehiclePrice: meta.price,
			vehicleLocation: 'Seoul',
			vehicleStockQuantity: 5,
			vehicleImages: sorted.map((f) => `uploads/vehicle/${f}`),
			vehicleDesc: meta.desc,
			vehicleBodyType: meta.bodyType,
			vehicleMileage: meta.mileage,
			memberId: agent._id,
		});
	}

	if (docs.length === 0) throw new Error('No vehicles were prepared — check the image filenames or META');

	// 5) Write to the database
	await VehicleModel.insertMany(docs);
	console.log(`🚗 Inserted ${docs.length} vehicles`);

	// 6) Update the dealer's vehicle count to match reality
	const realCount = await VehicleModel.countDocuments({ memberId: agent._id });
	await members.updateOne({ _id: agent._id }, { $set: { memberVehicles: realCount } });
	console.log(`📊 Updated dealer memberVehicles = ${realCount}`);

	await mongoose.disconnect();
	console.log('🎉 Done!');
}

seed().catch((err) => {
	console.error('❌ Error:', err.message);
	process.exit(1);
});