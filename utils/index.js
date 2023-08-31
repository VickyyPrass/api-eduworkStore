const { AbilityBuilder, createMongoAbility } = require("@casl/ability");

function getToken(req) {
    let token = req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : null;
    return token && token.length ? token : null;
}

// policy

const policies = {
    guest(user, { can }) {
        can("read", "Product");
    },
    user(user, { can }) {
        can("view", "Order");
        can("view", "DeliveryAddress");
        can("create", "Order");
        can("create", "DeliveryAddress", { user_id: user._id });
        can("read", "Order", { user_id: user._id });
        can("read", "Card"), { user_id: user._id };
        can("read", "Invoice", { user_id: user._id });
        can("update", "User", { user_id: user._id });
        can("update", "Cart", { user_id: user._id });
        can("update", "DeliveryAddress", { user_id: user._id });
        can("delete", "DeliveryAddress", { user_id: user._id });
    },
    admin(user, { can }) {
        can("manage", "all");
    },
};

const policyFor = (user) => {
    let builder = new AbilityBuilder(createMongoAbility);
    if (user && typeof policies[user.role] === "function") {
        policies[user.role](user, builder);
    } else {
        policies["guest"](user, builder);
    }
    return builder.build();
};

module.exports = {
    getToken,
    policyFor,
};
