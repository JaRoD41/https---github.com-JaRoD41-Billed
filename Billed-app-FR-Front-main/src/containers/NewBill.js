import { ROUTES_PATH } from '../constants/routes.js'
import Logout from './Logout.js'

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document
		this.onNavigate = onNavigate
		this.store = store
		const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
		formNewBill.addEventListener('submit', this.handleSubmit)
		const file = this.document.querySelector(`input[data-testid="file"]`)
		
		console.log('file dans constructor :', file);
		file.addEventListener('change', this.handleChangeFile)

		this.fileUrl = null
		this.fileName = null
		this.billId = null
		new Logout({ document, localStorage, onNavigate })
	}

	fileCheck = (file) => {
		const errorMessage = this.document.querySelector('.error-message')
		// Je verifie le type de fichier à uploader
		const fileTypes = ['image/jpeg', 'image/jpg', 'image/png']

		if (!fileTypes.includes(file.type)) {
			return false
		}
		errorMessage.classList.add('hidden')
		return true
	}

	handleChangeFile = (e) => {
		e.preventDefault()
		const errorMessage = this.document.querySelector('.error-message')
		// Correction du bug 3 : J'affiche un message d'erreur à l'utilisateur si le format de la pièce jointe n'est pas valide en créant une fonction  fileCkeck

		const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
		console.log('file :', file)
		// const file = e.target.files[0]

		// J'ajoute une condition pour vérifier qu'il y a bien une pièce jointe
		if (file) {
			const filePath = e.target.value.split(/\\/g)
			const fileName = filePath[filePath.length - 1]
			const formData = new FormData()
			const email = JSON.parse(localStorage.getItem('user')).email

			formData.append('file', file)
			formData.append('email', email)
			// Je vérifie que le fichier est bien au bon format grace à la méthode fileCheck
			if (this.fileCheck(file)) {
				this.store
					.bills()
					.create({
						data: formData,
						headers: {
							noContentType: true,
						},
					})
					.then(({ fileUrl, key }) => {
						this.billId = key
						this.fileUrl = fileUrl
						this.fileName = fileName
					})
					.catch((error) => {
						console.error(error)
					})
			} else {
				// Si le fichier n'est pas au bon format, je vide le champ de fichier
				e.target.value = ''
				errorMessage.classList.remove('hidden')
			}
		} else {
			return
		}
	}
	handleSubmit = (e) => {
		e.preventDefault()
		console.log(
			'e.target.querySelector(`input[data-testid="datepicker"]`).value',
			e.target.querySelector(`input[data-testid="datepicker"]`).value
		)
		const email = JSON.parse(localStorage.getItem('user')).email
		const bill = {
			email,
			type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
			name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
			amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
			date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
			vat: e.target.querySelector(`input[data-testid="vat"]`).value,
			pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
			commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
			fileUrl: this.fileUrl,
			fileName: this.fileName,
			status: 'pending',
		}
		this.updateBill(bill)
		this.onNavigate(ROUTES_PATH['Bills'])
	}

	// not need to cover this function by tests
	/* istanbul ignore next */
	updateBill = (bill) => {
		if (this.store) {
			this.store
				.bills()
				.update({ data: JSON.stringify(bill), selector: this.billId })
				.then(() => {
					this.onNavigate(ROUTES_PATH['Bills'])
				})
				.catch((error) => console.error(error))
		}
	}
}
