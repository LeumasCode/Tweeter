import asyncHandler from "express-async-handler";

export const getPost = asyncHandler(async (req, res, next) => {
   

   res.status(200).render('/post', payload)
});
