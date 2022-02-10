const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

module.exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const data = {
      fullName,
      email,
      password,
    };
    const { error } = Joi.object({
      fullName: Joi.string().required().min(3).max(32),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(3).max(64),
    }).validate(data);

    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(400).json({ error: 'Пользователь с такой почтой уже зарегистрирован' });
    }

    const user = await User.create({
      ...data,
      password: await bcrypt.hash(data.password, 10),
    });

    res.status(201).json({
      ...user.toJSON(),
      token: jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
        expiresIn: '30d',
      }),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

module.exports.me = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ errors: 'Вы не авторизованы' });
    }

    return res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Произошла ошибка' });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(3).max(64),
    }).validate({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const user = await User.findOne({ email }).select('fullName email password');

    if (!user) {
      return res.status(404).json({
        error: 'Пользователь не найден',
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (user && passwordCorrect) {
      return res.status(200).json({
        ...user.toJSON(),
        token: jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
          expiresIn: '30d',
        }),
      });
    }

    res.status(400).json({ error: 'Неверный логин или пароль' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Ошибка при авторизации' });
  }
};
