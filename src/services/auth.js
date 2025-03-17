import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

import { UsersCollection } from "../db/models/users.js";
import createHttpError from "http-errors";
import { SessionsCollection } from "../db/models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";

export async function registerUser(payload) {
  const emailExist = await UsersCollection.findOne({ email: payload.email });

  if (emailExist) {
    throw createHttpError(409, "Email in use");
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const user = await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
  return user;
}

export async function loginUser(payload) {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, "Unauthorized");
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString("base64");
  const refreshToken = randomBytes(30).toString("base64");

  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
}
