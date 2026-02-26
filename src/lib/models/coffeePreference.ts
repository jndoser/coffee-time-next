import { Schema, model, models } from "mongoose";

const CoffeePreferenceSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

        // What drinks they love
        favoriteDrinks: [{ type: String }],
        // e.g. ["espresso", "latte", "cold-brew", "cappuccino", "americano",
        //        "flat-white", "pour-over", "matcha", "mocha"]

        // How they brew at home
        brewMethods: [{ type: String }],
        // e.g. ["espresso-machine", "french-press", "pour-over",
        //        "aeropress", "moka-pot", "cold-brew", "drip"]

        // Roast preference
        roastLevel: {
            type: String,
            enum: ["light", "medium", "medium-dark", "dark"],
        },

        // Milk preference
        milkPreference: {
            type: String,
            enum: ["none", "whole-milk", "oat-milk", "almond-milk", "soy-milk", "coconut-milk"],
        },

        // Sugar level (0 = none, 4 = very sweet)
        sugarLevel: { type: Number, min: 0, max: 4, default: 1 },

        // How often they visit coffee shops
        visitFrequency: {
            type: String,
            enum: ["daily", "few-times-a-week", "weekends", "rarely"],
        },

        // Preferred time for coffee
        preferredTime: {
            type: String,
            enum: ["early-morning", "mid-morning", "afternoon", "evening", "late-night"],
        },
    },
    { timestamps: true }
);

const CoffeePreference =
    models?.CoffeePreference || model("CoffeePreference", CoffeePreferenceSchema);

export default CoffeePreference;
