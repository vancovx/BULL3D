const express = require('express')
const router = express.Router()
const { getGoals, setGoal, updateGoal, deleteGoal } = require('../controllers/goalController')
const { protect } = require('../middleware/authMiddleware')


router.route('/').get(getGoals).post(setGoal)
router.route('/:id').put(updateGoal).delete(deleteGoal)


//Desglose de como se hacen las rutas
/*
router.get('/', (req, res) => {
    res.status(200).json({message: 'Get goals'})
}
*/

//router.get('/', getGoals)
//router.post('/', setGoal)
    

module.exports = router
