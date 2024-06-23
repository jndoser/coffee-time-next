"use server";

import connect from "../db";
import User from "../models/user";

export async function createUser(user: any) {
  try {
    await connect();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error: any) {
    console.log(error);
  }
}
