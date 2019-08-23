'use strict';

module.exports = function(Reviews) {
  Reviews.observe('before save', async ctx => {
    if (!ctx.isNewInstance) {
      return Promise.resolve();
    }
    const review = ctx.instance;
    let appUser = await Reviews.findOne({
      where: {
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
      },
    });
    if (appUser) {
      const error = new Error('Review already exist');
      error.status = 400;
      throw error;
    }
    return Promise.resolve();
  });
};
