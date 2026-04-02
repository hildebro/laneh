import * as argon2 from 'argon2';

export const hashPassword = async (password: string): Promise<string> => {
  const hashingOptions = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB (passed in kilobytes)
    timeCost: 3,       // Number of iterations
    parallelism: 1    // Number of threads to use
  };

  return argon2.hash(password, hashingOptions);
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return argon2.verify(hashedPassword, password);
}