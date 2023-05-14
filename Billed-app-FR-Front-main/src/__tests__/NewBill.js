/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event'
import mockStore from '../__mocks__/store'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { localStorageMock } from '../__mocks__/localStorage'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import Router from '../app/Router'
import BillsUI from '../views/BillsUI.js'

// Je simule l'API grâce à la fonction mock qui va se substituer au fichier Store.js
jest.mock('../app/Store.js', () => mockStore)

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page', () => {
		// Je paramètre le local storage et la page du router pour simuler un user connecté grâce à beforeEach
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

			// Je simule un user connecté en temps qu'employé
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }))

			document.body.innerHTML = `<div id="root"></div>`
			Router()
		})
		// Test d'affichage de la page NewBill
		test('Then the NewBill form appears', () => {
			const html = NewBillUI()
			document.body.innerHTML = html
			expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
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
	describe('When I submit a form with an incorrect file extension', () => {
		// Je paramètre le local storage et la page du router pour simuler un user connecté grâce à beforeEach
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
			// Je simule un user connecté en temps qu'employé
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
			document.body.innerHTML = `<div id="root"></div>`
			Router()
		})

		test('Then an error message should be displayed and the file form should be reset', async () => {
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
	})

	// Je teste l'envoi du formulaire avec un fichier correct
	describe('When I submit a form with a correct file extension', () => {
		// Je paramètre le local storage et la page du router pour simuler un user connecté grâce à beforeEach
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
			// Je simule un user connecté en temps qu'employé
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
			document.body.innerHTML = `<div id="root"></div>`
			Router()
		})
		// Je crée un mock de la fonction console.error pour éviter d'afficher les erreurs dans le terminal
		afterAll(() => {
			console.error.mockRestore()
		})
		test('Then the file should be uploaded', async () => {
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
})
// Ajout des tests d'intégration POST
