module.exports.entityPaginate = async (entity, req) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const orderBy = req.query.orderBy === "asc" ? "createdAt" : "-createdAt";

  const searchArr = {
    Post: [
      {
        title: new RegExp(req.query.query, "i"),
      },
      {
        text: new RegExp(req.query.query, "i"),
      },
    ],
    Comment: [
      {
        text: new RegExp(req.query.query, "i"),
      },
    ],
    User: [
      {
        fullName: new RegExp(req.query.query, "i"),
      },
      {
        email: new RegExp(req.query.query, "i"),
      },
    ],
  };

  const total = await entity
    .countDocuments({
      $or: searchArr[entity.modelName],
    })
    .exec();

  return {
    total,
    items: await entity
      .find({
        $or: searchArr[entity.modelName],
      })
      .limit(limit)
      .skip(limit * (page - 1))
      .sort(orderBy)
      .populate(entity.modelName === "User" ? "" : "user"),
  };
};
