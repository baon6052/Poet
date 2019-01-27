const express = require("express");
const router = express.Router();

const PeopleController = require("../controllers/people");
const checkAuth = require('../middleware/check-auth');

router.post("/signup", PeopleController.people_signup);
router.post("", PeopleController.people_add);

router.post("/login", (req, res) => {
    return PeopleController.people_login(req, res);
});



router.delete("/:personId", checkAuth, PeopleController.person_delete);
router.get("", PeopleController.people_get_all);
router.get("/id/:personId", checkAuth, PeopleController.people_get_person);
router.get("/:username", PeopleController.username_get_person);

module.exports = router;