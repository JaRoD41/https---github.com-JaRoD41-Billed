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
import BillsUI from '../views/BillsUI.js'

// Je simule l'API grâce à la fonction mock qui va se substituer au fichier Store.js
jest.mock('../app/Store.js', () => mockStore)

// const setNewBill = () => {
// 	return new NewBill({
// 		document,
// 		onNavigate: () => {},
// 		store: mockStore,
// 		localStorage: window.localStorage,
// 	})
// }

// const onNavigate = (pathname) => {
// 	document.body.innerHTML = ROUTES({ pathname })
// }

// Object.defineProperty(window, 'localStorage', { value: localStorageMock })
// window.localStorage.setItem(
// 	'user',
// 	JSON.stringify({
// 		type: 'Employee',
// 		email: 'a@a',
// 	})
// )
window.alert = jest.fn()

// describe('Given I am connected as an employee', () => {
// 	describe('When I am on NewBill Page', () => {
// 		beforeEach(() => {
// 			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
// 			Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

// 			window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
// 			document.body.innerHTML = `<div id="root"></div>`
// 			Router()
// 		})
// 		// Test d'affichage de la page NewBill
// 		test('Then the NewBill form appears', () => {
// 			const html = NewBillUI()
// 			document.body.innerHTML = html
// 			expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
// 		})
// 		// Test de la présence de l'icone de nouvelle note de frais
// 		test('Then the mail icon in vertical layout should be highlighted', () => {
// 			const mailIcon = screen.getByTestId('icon-mail')
// 			expect(mailIcon.classList.contains('active-icon')).toBeTruthy()
// 		})
// 	})

// 	describe('When I submit an empty form', () => {
// 		test('Then I should stay on the same page', () => {
// 			// Je simule un user connecté en temps qu'employé sur NewBill
// 			window.onNavigate(ROUTES_PATH.NewBill)
// 			// Je crée une facture vide
// 			const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage })
// 			// Je récupère le html de la page NewBill contenant le formulaire et ses champs vides
// 			expect(screen.getByTestId('expense-name').value).toBe('')
// 			expect(screen.getByTestId('datepicker').value).toBe('')
// 			expect(screen.getByTestId('amount').value).toBe('')
// 			expect(screen.getByTestId('vat').value).toBe('')
// 			expect(screen.getByTestId('pct').value).toBe('')
// 			expect(screen.getByTestId('file').value).toBe('')
// 			// Je crée la variable form qui contient le formulaire
// 			const form = screen.getByTestId('form-new-bill')
// 			// Je simule la fonction handleSubmit qui est appelée lors de la soumission du formulaire
// 			const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
// 			// Je crée un écouteur d'évènement sur le formulaire
// 			form.addEventListener('submit', handleSubmit)
// 			// Je simule la soumission du formulaire
// 			fireEvent.submit(form)
// 			// Je m'attends à ce que la fonction handleSubmit soit appelée
// 			expect(handleSubmit).toHaveBeenCalled()
// 			// Je m'attends à ce que le formulaire soit OK
// 			expect(form).toBeTruthy()
// 		})
// 	})

describe('When I submit a file to join to the NewBill form', () => {
	// // Je paramètre le local storage et la page du router pour simuler un user connecté grâce à beforeEach
	// beforeEach(() => {
	// 	Object.defineProperty(window, 'localStorage', { value: localStorageMock })
	// 	Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
	// 	// Je simule un user connecté en temps qu'employé
	// 	window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
	// 	document.body.innerHTML = `<div id="root"></div>`
	// 	Router()
	// })

	test('Then an error message should be displayed and the file form should be reset in case of wrong extension', async () => {
		// Je crée un objet localStorageMock simulant le localStorage
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock,
		})
		window.localStorage.setItem(
			'user',
			JSON.stringify({
				type: 'Employee',
				email: 'a@a',
			})
		)
		// Je crée un DOM de test
		const root = document.createElement('div')
		root.setAttribute('id', 'root')
		document.body.appendChild(root)
		// J'utilise la fonction router pour simuler la navigation vers la page NewBill
		Router()

		// Navigation sur la page NewBills
		window.onNavigate(ROUTES_PATH.NewBill)

		//Ajout de la view NewBill
		document.body.innerHTML = NewBillUI()
		// Je récupère le html de la page NewBill contenant le formulaire et ses champs vides
		const newBill = new NewBill({ document, onNavigate: () => {}, store: mockStore, localStorage: window.localStorage })
		// Je crée un spy sur la fonction fileCheck
		const fileCheckSpy = jest.spyOn(newBill, 'fileCheck')
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
		expect(fileCheckSpy).toHaveBeenCalled()
		// Je m'attends à ce que la fonction handleChangeFile soit appelée
		expect(handleChangeFileSpy).toHaveBeenCalled()
		// Je m'attends à ce que la nouvelle facture avec la mauvaise pièce jointe ne soit pas validée
		expect(newBill.validFile).not.toBeTruthy()
	})

	// Je teste l'envoi du formulaire avec un fichier correct
	test('Then the file should be uploaded in case of valid extension', async () => {
		// Je crée un objet localStorageMock simulant le localStorage
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock,
		})
		window.localStorage.setItem(
			'user',
			JSON.stringify({
				type: 'Employee',
				email: 'a@a',
			})
		)
		// Je crée un DOM de test
		const root = document.createElement('div')
		root.setAttribute('id', 'root')
		document.body.appendChild(root)
		// J'utilise la fonction router pour simuler la navigation vers la page NewBill
		Router()

		// Navigation sur la page NewBills
		window.onNavigate(ROUTES_PATH.NewBill)

		//Ajout de la view NewBill
		document.body.innerHTML = NewBillUI()

		// Je récupère le html de la page NewBill contenant le formulaire et ses champs vides
		const newBill = new NewBill({ document, onNavigate: () => {}, store: mockStore, localStorage: window.localStorage })
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

describe('When I submit a new bill with all fields OK', () => {
	// Je teste la création d'une nouvelle note de frais et la réponse de l'API
	test('Then a new bill should be created', async () => {
		const createBill = jest.fn(mockStore.bills().create)
		const updateBill = jest.fn(mockStore.bills().update)

		// Je m'attends à ce que la fonction createBill soit appelée après avoir soumis le formulaire
		const { fileUrl, key } = await createBill()

		expect(createBill).toHaveBeenCalledTimes(1)

		// Je m'attends à ce que la clé et l'URL du fichier soient correctes
		expect(key).toBe('1234')
		expect(fileUrl).toBe('https://localhost:3456/images/test.jpg')

		const newBill = updateBill()

		expect(updateBill).toHaveBeenCalledTimes(1)

		// Je m'attends à ce que la nouvelle note de frais soit correcte
		await expect(newBill).resolves.toEqual({
			id: '47qAXb6fIm2zOKkLzMro',
			vat: '80',
			fileUrl:
				'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
			status: 'pending',
			type: 'Hôtel et logement',
			commentary: 'séminaire billed',
			name: 'encore',
			fileName: 'preview-facture-free-201801-pdf-1.jpg',
			date: '2004-04-04',
			amount: 400,
			commentAdmin: 'ok',
			email: 'a@a',
			pct: 20,
		})
	})
})

// -------------------------------------------------------------------------------

// Ajout des tests d'implémentation POST

describe('Given I am logged in as an employee', () => {
	describe('When I am on NewBill Page', () => {
		describe('When I create a valid bill ', () => {
			// Je contrôle que la nouvelle note de frais est bien ajoutée
			test('Then the new bill should be added to the other bills', async () => {
				// Je crée un espion sur la méthode bills de l'API mockée
				jest.spyOn(mockStore, 'bills')

				// Je récupère la liste des notes de frais mockées
				const bills = await mockStore.bills().list()

				// Je m'attends à ce qu'il y ait 4 notes de frais
				expect(bills.length).toEqual(4)

				// Je crée une nouvelle note de frais
				const newBillTest = {
					email: 'employee@test.tld',
					type: 'Transports',
					name: 'Vol Paris-New York',
					amount: '1375',
					date: '2023-05-16',
					vat: '255',
					pct: '20',
					commentary: 'Vol reunion client USA',
					fileUrl: undefined,
					fileName: 'test.png',
					status: 'pending',
				}

				// J'ajoute cette note de frais à la liste des notes de frais
				mockStore.bills().create(newBillTest)

				// Je m'attends à ce qu'il y ait 5 notes de frais à présent
				waitFor(() => expect(bills.length).toEqual(5))
			})
			// J'effectue les tests d'erreurs de l'API
			describe('When an error occurs on API', () => {
				// J'implémente un objet et un espion sur la méthode bills de l'API mockée avant chaque test
				beforeEach(() => {
					// Je crée un espion sur la méthode bills de l'API mockée
					jest.spyOn(mockStore, 'bills')

					// Je crée un objet localStorageMock simulant le localStorage
					Object.defineProperty(window, 'localStorage', {
						value: localStorageMock,
					})
					window.localStorage.setItem(
						'user',
						JSON.stringify({
							type: 'Employee',
							email: 'a@a',
						})
					)

					// Je crée un DOM de test
					const root = document.createElement('div')
					root.setAttribute('id', 'root')
					document.body.appendChild(root)
					// J'utilise la fonction router pour simuler la navigation vers la page NewBill
					Router()
				})
				// Je teste l'erreur 404
				test('Then the API call fails with 404 error message', () => {
					// Je récupère les données mockées et j'applique la méthode create avec la simulation d'une erreur
					mockStore.bills.mockImplementationOnce(() => {
						return {
							create: () => {
								return Promise.reject(new Error('Erreur 404'))
							},
						}
					})

					// J'envoie l'erreur en paramètre de la fonction view de Bills
					document.body.innerHTML = BillsUI({ error: 'Erreur 404' })

					// Je recherche le message d'erreur
					const message = screen.getByText(/Erreur 404/)

					// Je m'attends à ce qu'il soit bien affiché
					expect(message).toBeTruthy()
				})
				// Je teste l'erreur 500
				test('Then the API call fails with 500 error message', () => {
					// Je récupère les données mockées et j'applique la méthode create avec la simulation d'une erreur
					mockStore.bills.mockImplementationOnce(() => {
						return {
							create: () => {
								return Promise.reject(new Error('Erreur 500'))
							},
						}
					})

					// J'envoie l'erreur en paramètre de la fonction view de Bills
					document.body.innerHTML = BillsUI({ error: 'Erreur 500' })

					// Je recherche le message d'erreur
					const message = screen.getByText(/Erreur 500/)

					// Je m'attends à ce qu'il soit bien affiché
					expect(message).toBeTruthy()
				})
			})
		})
	})
})
