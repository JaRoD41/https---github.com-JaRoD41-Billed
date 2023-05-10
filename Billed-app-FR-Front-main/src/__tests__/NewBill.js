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
	describe('When I am on NewBill Page and I submit an empty form', () => {
		// Je paramètre le local storage et la page du router pour simuler un user connecté grâce à beforeEach
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

			// Je simule un user connecté en temps qu'employé
			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

			document.body.innerHTML = `<div id="root"></div>`
			Router()
		})
		test('Then the form should not be submitted', () => {
			const html = NewBillUI()
			document.body.innerHTML = html
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname })
			}

			const newBill = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			})
			const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
			const form = screen.getByTestId('form-new-bill')
			form.addEventListener('submit', handleSubmit)
			fireEvent.submit(form)
			// Je simule le submit du formulaire avec tous les champs vides
			expect(screen.getByTestId('datepicker').value).toBe('')
			expect(screen.getByTestId('amount').value).toBe('')
			expect(screen.getByTestId('vat').value).toBe('')
			expect(screen.getByTestId('pct').value).toBe('')
			expect(screen.getByTestId('file').value).toBe('')
			// Je vérifie que la fonction handleSubmit a été appelée
			expect(handleSubmit).toHaveBeenCalled()
			// Je vérifie que l'on reste sur la page NewBill
			expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
		})
	})
})
