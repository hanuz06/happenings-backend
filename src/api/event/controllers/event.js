"use strict";
const { sanitize } = require("@strapi/utils");

/**
 *  event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  // Get logged in users
  async me(ctx) {
    const user = ctx.state.user;
     if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }  

    const data = await strapi.db
      .query("api::event.event")
      .findMany({ where: { user: user.id } });
   
    if (!data) {
      return ctx.notFound();
    }

    const sanitizedEntity = await sanitize.contentAPI.output(data);

    return { data: sanitizedEntity };
  },
}));
