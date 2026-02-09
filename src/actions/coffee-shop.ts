"use server";

import { getUserId } from "@/app/utils/roles";
import connect from "@/lib/db";
import CoffeeShop from "@/lib/models/coffeeShop";
import User from "@/lib/models/user";
import LikeCoffeeShop from "@/lib/models/likeCoffeeShop";
import { Types } from "mongoose";
import axios from "axios";

export async function fetchCoffeeShops({
  page = 1,
  limit = 5,
  searchKeywords = "",
  userId = "",
  isRejected,
  isVerified,
}: {
  page?: number;
  limit?: number;
  searchKeywords?: string;
  userId?: string;
  isRejected?: boolean | string;
  isVerified?: boolean | string;
}) {
  try {
    const loggedInUserId = getUserId();

    if (!loggedInUserId) {
      throw new Error("Unauthorized");
    }

    await connect();
    let filter: any = {};

    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error("userId is invalid");
      }
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      filter.owner = userId;
    }

    // Mimic original API logic: defaults to false if not "true"
    filter.isRejected = String(isRejected) === "true";
    filter.isVerified = String(isVerified) === "true";

    const skip = (page - 1) * limit;

    if (searchKeywords) {
      filter.$or = [
        {
          title: { $regex: searchKeywords, $options: "i" },
        },
        { bio: { $regex: searchKeywords, $options: "i" } },
        { address: { $regex: searchKeywords, $options: "i" } },
        { description: { $regex: searchKeywords, $options: "i" } },
      ];
    }

    const coffeeShops = await CoffeeShop.aggregate([
      { $match: filter },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "likecoffeeshops",
          localField: "_id",
          foreignField: "coffeeShop",
          as: "likes",
        },
      },
      {
        $addFields: {
          likeCount: {
            $cond: {
              if: { $gt: [{ $size: "$likes" }, 0] },
              then: { $size: "$likes" },
              else: 0,
            },
          },
        },
      },
      {
        $lookup: {
          from: "likecoffeeshops",
          let: { coffeeShopId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$coffeeShop", "$$coffeeShopId"] },
                    { $eq: ["$user", new Types.ObjectId(loggedInUserId)] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "userLike",
        },
      },
      {
        $addFields: {
          isLiked: {
            $cond: {
              if: { $gt: [{ $size: "$userLike" }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          bio: 1,
          address: 1,
          description: 1,
          owner: {
            email: 1,
            username: 1,
            photo: 1,
            firstName: 1,
            lastName: 1,
            role: 1,
            isRejected: 1,
          },
          isVerified: 1,
          isRejected: 1,
          images: 1,
          likeCount: 1,
          isLiked: 1,
        },
      },
    ]);

    const totalCount = await CoffeeShop.countDocuments(filter);

    return {
        coffeeShops: JSON.parse(JSON.stringify(coffeeShops)),
        totalCount
    };
  } catch (error: any) {
    throw new Error("Error in fetching coffee shop: " + error.message);
  }
}

export async function createCoffeeShop(data: {
  title: string;
  address: string;
  bio: string;
  description: string;
  images: any[];
  userId: string;
}) {
  try {
    const { title, address, bio, description, images, userId } = data;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user");
    }

    await connect();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist");
    }

    const newCoffeeShop = new CoffeeShop({
      title,
      address,
      bio,
      description,
      images,
      owner: new Types.ObjectId(userId),
      isVerified: false,
      isRejected: false,
    });

    await newCoffeeShop.save();

    return {
      message: "Coffee shop is created",
      coffeeShop: JSON.parse(JSON.stringify(newCoffeeShop)),
    };
  } catch (error: any) {
    throw new Error("Error in creating coffee shop: " + error.message);
  }
}

export async function fetchCoffeeShopById(coffeeShopId: string) {
  try {
    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      throw new Error("Invalid coffeeShopId");
    }

    await connect();
    const coffeeShop = await CoffeeShop.findById(coffeeShopId);

    if (!coffeeShop) {
      throw new Error("Coffee Shop does not exist");
    }

    return JSON.parse(JSON.stringify(coffeeShop));
  } catch (error: any) {
    throw new Error("Error while fetching coffee shop: " + error.message);
  }
}

export async function updateCoffeeShop(
  coffeeShopId: string,
  data: {
    title: string;
    address: string;
    bio: string;
    description: string;
    images: any[];
    userId: string;
  }
) {
  try {
    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      throw new Error("Invalid coffeeShopId");
    }

    const { title, address, bio, description, images, userId } = data;

    await connect();

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid or missing userId");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const coffeeShop = await CoffeeShop.findOne({
      _id: coffeeShopId,
      owner: userId,
    });
    if (!coffeeShop) {
      throw new Error("Not found coffee shop");
    }

    const updatedCoffeeShop = await CoffeeShop.findByIdAndUpdate(
      coffeeShopId,
      { title, address, bio, description, images },
      { new: true }
    );

    return {
      message: "Coffee shop is updated",
      category: JSON.parse(JSON.stringify(updatedCoffeeShop)),
    };
  } catch (error: any) {
    throw new Error("Error while updating coffee shop: " + error.message);
  }
}

export async function updateCoffeeShopStatus(
  coffeeShopId: string,
  action: "APPROVE" | "REVOKE" | "REJECT"
) {
  try {
    if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
      throw new Error("Invalid coffeeShopId");
    }

    await connect();

    const coffeeShop = await CoffeeShop.findById(coffeeShopId);
    if (!coffeeShop) {
      throw new Error("Not found coffee shop");
    }

    let updatedCoffeeShop;

    if (action === "APPROVE") {
      updatedCoffeeShop = await CoffeeShop.findByIdAndUpdate(
        coffeeShopId,
        { isVerified: true },
        { new: true }
      );
    } else if (action === "REVOKE") {
      updatedCoffeeShop = await CoffeeShop.findByIdAndUpdate(
        coffeeShopId,
        { isVerified: false },
        { new: true }
      );
    } else if (action === "REJECT") {
      updatedCoffeeShop = await CoffeeShop.findByIdAndUpdate(
        coffeeShopId,
        { isRejected: true },
        { new: true }
      );
    } else {
        throw new Error("Invalid action value");
    }

    return {
      message: `Coffee shop is ${action.toLowerCase()} successfully`,
      category: JSON.parse(JSON.stringify(updatedCoffeeShop)),
    };
  } catch (error: any) {
    throw new Error("Error while updating coffee shop status: " + error.message);
  }
}

export async function searchNearbyCoffeeShops(location: string, radius: string) {
    try {
        const serializeLocation = location?.split(",").join("%2C");
        const requestUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${serializeLocation}&radius=${radius}&type=cafe&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`;

        const response = await axios.get(requestUrl);
        const result = response.data.results.map((place: any) => ({
          location: {
            lat: place.geometry.location.lat as number,
            lng: place.geometry.location.lng as number,
          },
          name: place.name as string,
        }));

        return result;
      } catch (error: any) {
        throw new Error("Error in getting nearby coffee shop: " + error.message);
      }
}

export async function getLikes(coffeeShopId: string) {
    try {
        if (!coffeeShopId || !Types.ObjectId.isValid(coffeeShopId)) {
          throw new Error("Invalid coffeeShopId");
        }

        const userId = getUserId();

        if (!userId) {
          throw new Error("Unauthorized");
        }

        await connect();
        const coffeeShop = await CoffeeShop.findById(coffeeShopId);

        if (!coffeeShop) {
            throw new Error("Coffee Shop does not exist");
        }

        const likesCount = await LikeCoffeeShop.countDocuments({ coffeeShop: coffeeShopId });
        const userLikesExists = await LikeCoffeeShop.exists({
          coffeeShop: coffeeShopId,
          user: userId,
        });

        return {
          likes: likesCount,
          isLikedByUser: !!userLikesExists,
        };
      } catch (error: any) {
        throw new Error("Error while fetching likes: " + error.message);
      }
}

export async function toggleLike(coffeeShopId: string) {
    try {
        const userId = getUserId();

        if (!userId) {
          throw new Error("Unauthorized");
        }

        await connect();

        const exists = await LikeCoffeeShop.exists({
            user: userId,
            coffeeShop: coffeeShopId,
        });

        if (exists) {
            await LikeCoffeeShop.findOneAndDelete({
                user: userId,
                coffeeShop: coffeeShopId,
            });
            return { message: "Unlike successfully", isLiked: false };
        } else {
            const newLikes = new LikeCoffeeShop({
                user: userId,
                coffeeShop: coffeeShopId,
            });
            await newLikes.save();
            return { message: "Like successfully", isLiked: true };
        }
      } catch (error: any) {
        throw new Error("Error while toggling like: " + error.message);
      }
}
