import { Hono } from "hono";
import { imageRoutes } from "./images";
import { categoryRoutes } from "./categories";

const apiRoutes = new Hono();

// Mount image routes
apiRoutes.route("/images", imageRoutes);

// Mount category routes  
apiRoutes.route("/categories", categoryRoutes);

export { apiRoutes };
