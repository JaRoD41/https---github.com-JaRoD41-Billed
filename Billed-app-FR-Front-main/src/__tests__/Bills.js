/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES_PATH, ROUTES } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import userEvent from '@testing-library/user-event'
import Bills from '../containers/Bills.js'
import mockStore from '../__mocks__/store.js'

import router from '../app/Router.js'

// j'ai besoin de simuler l'API grace à la fonction mock qui va se substituer au fichier Store.js
jest.mock('../app/Store.js', () => mockStore)

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		test('Then bill icon in vertical layout should be highlighted', async () => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			)
			const root = document.createElement('div')
			root.setAttribute('id', 'root')
			document.body.append(root)
			router()
			window.onNavigate(ROUTES_PATH.Bills)
			await waitFor(() => screen.getByTestId('icon-window'))
			const windowIcon = screen.getByTestId('icon-window')
			expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
		})
		test('Then bills should be ordered from earliest to latest', () => {
			document.body.innerHTML = BillsUI({ data: bills })
			const dates = screen
				.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
				.map((a) => a.innerHTML)

			const antiChrono = (a, b) => (a < b ? 1 : -1)
			const datesSorted = [...dates].sort(antiChrono)
			expect(dates).toEqual(datesSorted)
		})
	})
})

// Ajout des tests unitaires pour parfaire la couverture de Bills.js

describe('Given I am connected as an Employee and I am on Bills page', () => {
	describe('When I click on the icon eye', () => {
		test('Then a modal should open with a screenshot of the bill', () => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			)
			document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname })
			}
			// Je crée une instance de Bills pour créer une facture
			const billsDom = new Bills({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			})

			$.fn.modal = jest.fn()
			const handleClickIconEye = jest.fn((e) => billsDom.handleClickIconEye(e.target))
			const eye = screen.getAllByTestId('icon-eye')[0]
			eye.addEventListener('click', handleClickIconEye)
			userEvent.click(eye)
			// La fonction handleClickIconEye doit être appelée
			expect(handleClickIconEye).toHaveBeenCalled()
			// La page affichée doit contenir le screenshot de la facture
			expect(screen.getByAltText('Bill')).toBeTruthy()
			expect(screen.getByText('Justificatif')).toBeTruthy()
		})
	})
	describe('When I click on the new bill button', () => {
		test('Then it should open the newBill page', () => {
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname })
			}
			// Je crée une instance de Bills pour créer une facture
			const billsDom = new Bills({
				document,
				onNavigate,
				mockStore,
				localStorage: window.localStorage,
			})

			$.fn.modal = jest.fn() // Je simule le comportement de la fonction modal de bootstrap
			const handleClickNewBill = jest.fn((e) => billsDom.handleClickNewBill(e))
			const buttonNewBill = screen.getByTestId('btn-new-bill')
			buttonNewBill.addEventListener('click', handleClickNewBill)
			userEvent.click(buttonNewBill)
			// La fonction handleClickNewBill doit être appelée
			expect(handleClickNewBill).toHaveBeenCalled()
			// La page doit contenir le formulaire de création d'une facture
			expect(screen.getByTestId('form-new-bill')).toBeTruthy()
			// La page doit contenir le bouton de soumission du formulaire
			expect(screen.getByTestId('form-new-bill')).toBeTruthy()
		})
	})
})
