import { Hono } from "hono";
import { imageRoutes } from "./images";
import { categoryRoutes } from "./categories";
import { placeRoutes } from "./places";
import adsRoutes from "./ads";
import type { Bindings } from "../types";

const apiRoutes = new Hono<{ Bindings: Bindings }>();

// Mount image routes
apiRoutes.route("/images", imageRoutes);

// Mount category routes  
apiRoutes.route("/categories", categoryRoutes);

// Mount place routes
apiRoutes.route("/places", placeRoutes);

// Mount ads routes
apiRoutes.route("/ads", adsRoutes);

export { apiRoutes };
