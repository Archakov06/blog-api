const validator = require("validator");
const { Post } = require("../models/Post");

module.exports.checkUser = (checkIsOwner, Entity) => async (req, res, next) => {
  if (req.userId) {
    if (checkIsOwner) {
      const id = req.params.id;

      if (!id) {
        return res.status(400);
      }

      if (!validator.isMongoId(id)) {
        return res.status(400).json({ error: "Неверный ID записи" });
      }

      const userId = req.userId;
      const post = await Entity.findById(id);
      if (post) {
        if (post.user._id.toString() === userId) {
          return next();
        } else {
          return res
            .status(403)
            .json({ error: "У вас нет доступа к этой записи" });
        }
      }
      return res.status(404).json({ error: "Такой записи нет в базе" });
    }

    next();
  } else {
    res
      .status(403)
      .json({ error: "Вы не авторизованы для выполнения этой операции" });
  }
};
