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

// const onNavigate = (pathname) => {
// 	document.body.innerHTML = ROUTES({ pathname })
// }

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page', () => {
		// Je paramètre le local storage et la page du router pour simuler un user connecté grâce à beforeEach
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

			// Je simule un user connecté en temps qu'employé
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

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
		test('Then an error message should be displayed and the file form should be reset', () => {
			// Je simule un user connecté en temps qu'employé sur NewBill
			window.onNavigate(ROUTES_PATH.NewBill)
			// Je crée une facture vide
			const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage })
			// Je récupère le html de la page NewBill contenant le formulaire et ses champs vides
			//const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
			const wrongFile = new File(['hello'], 'hello.png', { type: 'image/webp' })
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
			// Je m'attends à ce que le champ file contienne le fichier incorrect
			expect(screen.getByTestId('file').toBe(wrongFile))
			// Je m'attends à ce que le message d'erreur soit affiché
			expect(screen.getByText('Veuillez sélectionner un fichier au format png, jpeg ou jpg)')).toBeTruthy()
		})
	})
})
