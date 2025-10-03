import { Hono } from "hono";
import { imageRoutes } from "./images";
import { categoryRoutes } from "./categories";
import destinationRoutes from "./destinations";
import { placeRoutes } from "./places";
import adsRoutes from "./ads";

const apiRoutes = new Hono();

// Mount image routes
apiRoutes.route("/images", imageRoutes);

// Mount category routes  
apiRoutes.route("/categories", categoryRoutes);

// Mount destination routes
apiRoutes.route("/destinations", destinationRoutes);

// Mount place routes
apiRoutes.route("/places", placeRoutes);

// Mount ads routes
apiRoutes.route("/ads", adsRoutes);

export { apiRoutes };
