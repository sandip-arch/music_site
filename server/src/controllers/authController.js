const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { sendOtpEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'spotify_clone_jwt_secret_dev_2026';

const register = async (req, res) => {
  try {
    const { email, password, name, role = 'USER' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = ['USER', 'ARTIST', 'ADMIN'].includes(role) ? role : 'USER';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: assignedRole,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1db954`,
      },
    });

    if (assignedRole === 'ARTIST') {
      await prisma.artist.create({
        data: {
          name: user.name,
          bio: `Verified artist profile for ${user.name}`,
          image: user.avatarUrl,
          isVerified: true,
          userId: user.id,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { artist: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        artistId: user.artist?.id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        artist: true,
        likedTracks: {
          select: { trackId: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      artistId: user.artist?.id,
      createdAt: user.createdAt,
      likedTrackIds: user.likedTracks.map((lt) => lt.trackId),
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update profile picture and display name
const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, avatarUrl } = req.body;

    const dataToUpdate = {};
    if (name && name.trim()) dataToUpdate.name = name.trim();
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      include: { artist: true },
    });

    // Also update artist image and name if user is an artist
    if (updatedUser.artist) {
      await prisma.artist.update({
        where: { id: updatedUser.artist.id },
        data: {
          name: updatedUser.name,
          image: updatedUser.avatarUrl,
        },
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        artistId: updatedUser.artist?.id,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Update password with current password verification
const updatePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('updatePassword error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

// Forgot Password - Step 1: Send 6-Digit Email OTP (Valid for 5 mins)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address' });
    }

    // Generate random 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5-minute expiration time
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any old OTPs for this email to prevent reuse
    await prisma.passwordResetOtp.deleteMany({
      where: { email: user.email },
    });

    // Store new OTP in database
    await prisma.passwordResetOtp.create({
      data: {
        email: user.email,
        otp,
        expiresAt,
      },
    });

    console.log(`[OTP GENERATED] Email: ${user.email} | OTP: ${otp} | Expires in: 5 minutes`);

    // Dispatch email with Nodemailer
    await sendOtpEmail(user.email, otp);

    res.json({
      message: 'A 6-digit verification code has been sent to your email. It is valid for 5 minutes.',
      email: user.email,
      // For effortless local test demonstration when no live SMTP server is configured
      demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ error: 'Failed to send password reset code' });
  }
};

// Forgot Password - Step 2: Verify OTP and Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Find valid matching unexpired OTP record
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        email: normalizedEmail,
        otp: cleanOtp,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({
        error: 'Invalid or expired OTP code. Verification codes are valid for only 5 minutes.',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });

    // Remove used OTP
    await prisma.passwordResetOtp.deleteMany({
      where: { email: normalizedEmail },
    });

    res.json({
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

const getDemoAccounts = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('getDemoAccounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  getDemoAccounts,
};
