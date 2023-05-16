/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import mockStore from '../__mocks__/store'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { localStorageMock } from '../__mocks__/localStorage'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import Router from '../app/Router'
import { bills } from '../fixtures/bills'
import BillsUI from '../views/BillsUI.js'

// Je simule l'API grâce à la fonction mock qui va se substituer au fichier Store.js
jest.mock('../app/Store.js', () => mockStore)

const onNavigate = (pathname) => {
	document.body.innerHTML = ROUTES({ pathname })
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem(
	'user',
	JSON.stringify({
		type: 'Employee',
		email: 'a@a',
	})
)
window.alert = jest.fn()

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page', () => {
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
			document.body.innerHTML = `<div id="root"></div>`
			Router()
		})
		// Test d'affichage de la page NewBill
		test('Then the NewBill form appears', () => {
			const html = NewBillUI()
			document.body.innerHTML = html
			expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
		})
		// Test de la présence de l'icone de nouvelle note de frais
		test('Then the mail icon in vertical layout should be highlighted', () => {
			const mailIcon = screen.getByTestId('icon-mail')
			expect(mailIcon.classList.contains('active-icon')).toBeTruthy()
		})
	})

	describe('When I submit an empty form', () => {
		test('Then I should stay on the same page', () => {
			// Je simule un user connecté en temps qu'employé sur NewBill
			window.onNavigate(ROUTES_PATH.NewBill)
			// Je crée une facture vide
			const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage })
			// Je récupère le html de la page NewBill contenant le formulaire et ses champs vides
			expect(screen.getByTestId('expense-name').value).toBe('')
			expect(screen.getByTestId('datepicker').value).toBe('')
			expect(screen.getByTestId('amount').value).toBe('')
			expect(screen.getByTestId('vat').value).toBe('')
			expect(screen.getByTestId('pct').value).toBe('')
			expect(screen.getByTestId('file').value).toBe('')
			// Je crée la variable form qui contient le formulaire
			const form = screen.getByTestId('form-new-bill')
			// Je simule la fonction handleSubmit qui est appelée lors de la soumission du formulaire
			const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
			// Je crée un écouteur d'évènement sur le formulaire
			form.addEventListener('submit', handleSubmit)
			// Je simule la soumission du formulaire
			fireEvent.submit(form)
			// Je m'attends à ce que la fonction handleSubmit soit appelée
			expect(handleSubmit).toHaveBeenCalled()
			// Je m'attends à ce que le formulaire soit OK
			expect(form).toBeTruthy()
		})
	})

	describe('When I submit a file to join to the NewBill form', () => {
		// Je paramètre le local storage et la page du router pour simuler un user connecté grâce à beforeEach
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
			// Je simule un user connecté en temps qu'employé
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
			document.body.innerHTML = `<div id="root"></div>`
			Router()
		})

		test('Then an error message should be displayed and the file form should be reset in case of wrong extension', async () => {
			// Je récupère le html de la page NewBill contenant le formulaire et ses champs vides
			const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage })
			// Je crée un spy sur la fonction showFileError
			const showFileErrorSpy = jest.spyOn(newBill, 'showFileError')
			// Je crée un spy sur la fonction handleChangeFile
			const handleChangeFileSpy = jest.spyOn(newBill, 'handleChangeFile')
			// Je crée la variable inputFile qui contient le champ file
			const inputFile = screen.getByTestId('file')
			// Je crée un fichier incorrect
			const wrongFile = new File(['img'], 'justif.webp', { type: 'image/webp' })
			// Je crée un écouteur d'évènement sur le champ file
			inputFile.addEventListener('change', handleChangeFileSpy)
			// Je simule le changement de fichier
			await waitFor(() => {
				userEvent.upload(inputFile, wrongFile)
			})
			// Je crée la variable form qui contient le formulaire
			const form = screen.getByTestId('form-new-bill')
			// Je simule la fonction handleSubmit qui est appelée lors de la soumission du formulaire
			const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
			// Je crée un écouteur d'évènement sur le formulaire
			form.addEventListener('submit', handleSubmit)

			// Je m'attends à ce que le champ file contienne le fichier incorrect
			expect(inputFile.files[0].name).toBe('justif.webp')
			// Je m'attends à ce que le message d'erreur soit affiché
			expect(showFileErrorSpy).toHaveBeenCalled()
			// Je m'attends à ce que la fonction handleChangeFile soit appelée
			expect(handleChangeFileSpy).toHaveBeenCalled()
			// Je m'attends à ce que la nouvelle facture avec la mauvaise pièce jointe ne soit pas validée
			expect(newBill.validFile).not.toBeTruthy()
		})

		// Je teste l'envoi du formulaire avec un fichier correct
		test('Then the file should be uploaded in case of valid extension', async () => {
			// Je paramètre le local storage et la page du router pour simuler un user connecté grâce à beforeEach

			// Je récupère le html de la page NewBill contenant le formulaire et ses champs vides
			const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage })
			// Je crée un mock de la fonction create de bills
			const createBillMock = jest.fn().mockResolvedValue({ fileUrl: 'test', key: 'test' })
			newBill.store = { bills: () => ({ create: createBillMock }) }
			// Je simule la fonction handleChangeFile qui est appelée lors du changement de fichier
			const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
			// Je crée la variable inputFile qui contient le champ file
			const inputFile = screen.getByTestId('file')
			// Je crée un fichier correct
			const correctFile = new File(['img'], 'justif.png', { type: 'image/png' })
			// Je crée un écouteur d'évènement sur le champ file
			inputFile.addEventListener('change', handleChangeFile)
			// Je simule le changement de fichier
			await waitFor(() => {
				userEvent.upload(inputFile, correctFile)
			})

			// Je m'attends à ce que le champ file contienne le fichier correct
			expect(inputFile.files[0].name).toBe('justif.png')
			// Je m'attends à ce que la fonction create de bills soit appelée avec les bonnes données
			expect(createBillMock).toHaveBeenCalledWith({
				data: expect.any(FormData),
				headers: { noContentType: true },
			})
		})
	})

	// Ajout des tests d'intégration POST

	describe('When I submit a new bill with all fields OK', () => {
		test('Then It should create a bill', async () => {

			// Je paramètre le local storage et la page du router pour simuler un employé connecté 
			localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }))

			// J'ai besoin d'émuler l'affichage de la page NewBill
			const html = NewBillUI()
			document.body.innerHTML = html

			// Je crée un mock d'une nouvelle instance de la classe NewBill
			const newBill = new NewBill({
				document,
				onNavigate: () => {},
				store: mockStore,
				localStorage: window.localStorage,
			})

			// Je crée un espion sur la fonction handleChangeFile
			const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile')
			const imageInput = screen.getByTestId('file')

			imageInput.addEventListener('change', handleChangeFile)

			// Je m'attends à être sur la page NewBill
			expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()

			// Je crée un espion sur la fonction handleSubmit
			const handleSubmit = jest.fn(newBill.handleSubmit)
			const correctFile = new File(['img'], 'justif.png', { type: 'image/png' })

			// Je peuple les champs du formulaire
			fireEvent.change(screen.getByTestId('expense-type'), {
				target: { value: 'Transports' },
			})
			fireEvent.change(screen.getByTestId('expense-name'), {
				target: { value: 'Vol Paris-New York' },
			})
			fireEvent.change(screen.getByTestId('datepicker'), {
				target: { value: '2023-05-15' },
			})
			fireEvent.change(screen.getByTestId('amount'), {
				target: { value: '1375' },
			})
			fireEvent.change(screen.getByTestId('vat'), {
				target: { value: '20' },
			})
			fireEvent.change(screen.getByTestId('pct'), {
				target: { value: '255' },
			})
			fireEvent.change(screen.getByTestId('commentary'), {
				target: { value: 'Vol reunion client USA' },
			})

			// Je simule le chargement du fichier
			await waitFor(() => {
				userEvent.upload(imageInput, correctFile)
			})

			const form = screen.getByTestId('form-new-bill')
			// Je crée un écouteur d'évènement sur le formulaire
			form.addEventListener('submit', handleSubmit)

			// Je simule la soumission du formulaire
			fireEvent.submit(form)

			// Je m'attends à ce que la fonction handleSubmit soit appelée
			expect(handleSubmit).toHaveBeenCalled()

			// Je m'attends à ce que les champs suivants contiennent une valeur valide
			expect(screen.getByTestId('datepicker').validity.valueMissing).toBeFalsy()
			expect(screen.getByTestId('expense-name').validity.valueMissing).toBeFalsy()

			// console.log(mockStore.bills().update)
			// expect(mockStore.bills().update.mock.calls[0])
		})
	})
})
