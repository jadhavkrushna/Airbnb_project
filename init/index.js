const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "../.env" });
}

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to database:", mongoose.connection.name);
}

const initDB = async () => {
    try {
        // 1. Delete
        const delResult = await Listing.deleteMany({});
        console.log("🗑️ Deleted docs count:", delResult.deletedCount);

        // 2. Map data
        const mappedData = initData.data.map((obj) => ({
            ...obj,
            owner: "684e98020ba691cb96a3f04d"
        }));

        // 3. Insert
        const insResult = await Listing.insertMany(mappedData);
        console.log("✅ Inserted docs count:", insResult.length);

        // 4. Verify collection exists in this connection
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("📂 Collections in this DB:", collections.map(c => c.name));

        // 5. Final check
        const finalCount = await Listing.countDocuments();
        console.log("📊 Final Listing Count:", finalCount);

    } catch (err) {
        console.error("❌ Seeding Error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Connection closed");
    }
};

main().then(initDB);