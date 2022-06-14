"use strict";
const { sanitize } = require("@strapi/utils");

/**
 *  event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  // Create event with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);      
      data.user = ctx.state.user.id;
      data.image = files;
      // entity = await strapi.services.events.create(data, { files });
      entity = await strapi.db
        .query("api::event.event")
        .create({ data });
    } else {
      console.log(' ctx.state.user.id ', ctx.state.user.id)
      ctx.request.body.data.user = ctx.state.user.id;
      console.log(' ctx.request.body ', ctx.request.body)
      // entity = await strapi.services.events.create(ctx.request.body);
      entity = await strapi.db
        .query("api::event.event")
        .create({ data: ctx.request.body.data });
    }
    // return sanitizeEntity(entity, { model: strapi.models.events });
    const sanitizedEntity = await sanitize.contentAPI.output(entity);
    return { data: sanitizedEntity };
  },

  // Update user event
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    // const [events] = await strapi.services.events.find({
    //   id: ctx.params.id,
    //   "user.id": ctx.state.user.id,
    // });

    const [events] = await strapi.db
      .query("api::event.event")
      .findMany({ where: { id, user: ctx.state.user.id } });

    if (!events) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      // entity = await strapi.services.events.update({ id }, data, {
      //   files,
      // });
      data.image = files;
      entity = await strapi.db
        .query("api::event.event")
        .update({ where: { id }, data });
    } else {
      entity = await strapi.db
      .query("api::event.event").update({
        where: { id },
        data: ctx.request.body,
      });
    }

    // return sanitizeEntity(entity, { model: strapi.models.events });
    const sanitizedEntity = await sanitize.contentAPI.output(entity);

    return { data: sanitizedEntity };
  },
  // Delete a user event
  async delete(ctx) {
    const { id } = ctx.params;

    // const [events] = await strapi.services.events.find({
    //   id: ctx.params.id,
    //   "user.id": ctx.state.user.id,
    // });

    const [events] = await strapi.db
      .query("api::event.event")
      .findMany({ where: { id, user: ctx.state.user.id } });

    if (!events) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    // const entity = await strapi.services.events.delete({ id });
    const entity = await strapi.db.query("api::event.event").delete({ where: { id } });

    // return sanitizeEntity(entity, { model: strapi.models.events });
    const sanitizedEntity = await sanitize.contentAPI.output(entity);

    return { data: sanitizedEntity };
  },
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
