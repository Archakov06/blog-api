const Joi = require('joi');
const validator = require('validator');
const { Comment } = require('../models/Comment');
const { entityPaginate } = require('../utils/entityPaginate');

const checkCommentBody = Joi.object({
  text: Joi.string().required().min(3).max(65536),
  user: Joi.string().required().length(24),
  post: Joi.string().required().length(24),
});

module.exports.all = async (req, res) => {
  try {
    const result = await entityPaginate(Comment, req);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Произошла серверная ошибка' });
  }
};

module.exports.create = async (req, res) => {
  const { text, postId } = req.body;
  const data = {
    text,
    user: req.userId,
    post: postId,
  };
  const { error } = checkCommentBody.validate(data);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
  } else {
    const comment = new Comment(data);
    try {
      const result = await comment.save().then((doc) => doc.populate('user'));
      if (result) {
        console.log(result);
        return res.status(201).json(result);
      }
      return res.status(400).json({ error: 'Не удалось создать комментарий' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Произошла серверная ошибка' });
    }
  }
};

module.exports.postComments = async (req, res) => {
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    res.status(400).json({ error: 'Неверный ID записи' });
  } else {
    try {
      const result = await Comment.find({ post: id }).populate('user');
      if (result) {
        return res.status(200).json(result);
      }
      return res.status(404).json({ error: 'Такой записи нет в базе' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Произошла серверная ошибка' });
    }
  }
};

module.exports.update = async (req, res) => {
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    res.status(400).json({ error: 'Неверный ID комментария' });
  } else {
    const { error } = Joi.object({
      text: Joi.string().required().min(3).max(65536),
    }).validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
    } else {
      try {
        await Comment.findByIdAndUpdate(id, { $set: req.body });
        const result = await Comment.findById(id);
        if (result) {
          return res.status(202).json(result);
        }
        return res.status(400).json({ error: 'Такого комментария нет в базе' });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Произошла серверная ошибка' });
      }
    }
  }
};

module.exports.delete = async (req, res) => {
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    res.status(400).json({ error: 'Неверный ID комментария' });
  } else {
    try {
      const result = await Comment.findByIdAndDelete(id);
      if (result) {
        return res.status(202).json();
      }
      return res.status(400).json({ error: 'Такого комментария нет в базе' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Произошла серверная ошибка' });
    }
  }
};
