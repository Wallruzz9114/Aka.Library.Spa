import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Book } from '../shared/book';
import { GoogleBooksMetadata } from '../shared/google-books-metadata';
import { LibraryBook } from '../shared/library-book';
import { SignedOutBook } from '../shared/signed-out-book';

@Injectable()
export class BooksService {
  apiUrl: string;
  googleBooksAPIKey: string;
  value: number;
  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}${environment.apiPath}/libraries/`;
    this.googleBooksAPIKey = 'AIzaSyCCN_lQcnEQ51ohoDBroFvfwN8wnJi9iPY';
  }

  getBooks(libraryId: number): Observable<Book[]> {
    const url = `${this.apiUrl}${libraryId}/books`;

    return this.http
      .get<LibraryBook[]>(url)
      .pipe(
        map((items) =>
          items
            .filter((item) => item.totalPurchasedByLibrary > 0)
            .map((item) => item.book)
        )
      );
  }

  getBook(libraryId: number, bid: number): Observable<Book> {
    const url = `${this.apiUrl}${libraryId}/books/${bid}`;
    return this.http.get<Book>(url);
  }

  getAvailableBooks(libraryId: number): Observable<Book[]> {
    const url = `${this.apiUrl}${libraryId}/books/available`;
    return this.http.get<Book[]>(url);
  }

  getCheckedOutBooks(libraryId: number): Observable<Book[]> {
    const url = `${this.apiUrl}${libraryId}/books/checkedout`;
    return this.http.get<Book[]>(url);
  }

  /**
   * For a given library and given book return the total number of copies for the book
   *
   * @param {number} libraryId Library to look for book
   * @param {number} bookId Book to find
   * @returns {Observable<number>} Count of books
   * @memberof BooksService
   */
  getTotalNumberOfCopiesInLibrary(
    libraryId: number,
    bookId: number
  ): Observable<number> {
    // TODO: Add implementation
    const url = `${this.apiUrl}${libraryId}/books`;

    return this.http.get<LibraryBook[]>(url).pipe(
      map((books: LibraryBook[]) => {
        const book = books.find(
          (libraryBook: LibraryBook) => libraryBook.book.bookId === bookId
        );
        return book ? book.totalPurchasedByLibrary : 0;
      })
    );
  }

  /**
   * This function should calculate the number of available copies of a book within a library given a libraryId and a bookId
   * using the api
   *
   * @param {number} libraryId
   * @param {number} bookId
   * @returns {Observable<number>}
   * @memberof BooksService
   */
  getNumberOfAvailableBookCopies(
    libraryId: number,
    bookId: number
  ): Observable<number> {
    // TODO: Add implementation
    return forkJoin([
      this.getTotalNumberOfCopiesInLibrary(libraryId, bookId),
      this.getCheckedOutBooks(libraryId),
    ]).pipe(
      map(([totalInLibrary, checkedOutBooks]) => {
        if (totalInLibrary > 0) {
          const checkedOutBooksLength = checkedOutBooks.filter(
            (b) => b.bookId === bookId
          ).length;
          return totalInLibrary >= checkedOutBooksLength
            ? totalInLibrary - checkedOutBooksLength
            : 0;
        }

        return 0;
      })
    );
  }

  checkOutBook(
    libraryId: number,
    bookId: number,
    memberId: number
  ): Observable<SignedOutBook> {
    const url = `${this.apiUrl}${libraryId}/books/${bookId}/signout/${memberId}`;
    return this.http.post<SignedOutBook>(url, {});
  }

  returnBook(
    libraryId: number,
    bookId: number,
    memberId: number
  ): Observable<SignedOutBook> {
    const url = `${this.apiUrl}${libraryId}/books/${bookId}/return/${memberId}`;
    return this.http.put<SignedOutBook>(url, {});
  }

  /**
   * Gets all the meta information for the book
   * The google api reference to get meta data https://developers.google.com/books/docs/v1/using
   *
   * @param {string} isbn
   * @returns {Observable<GoogleBooksMetadata>}
   * @memberof BooksService
   */
  getBookMetaData(isbn: string): Observable<GoogleBooksMetadata> {
    // TODO: Add implementation
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${this.googleBooksAPIKey}`;
    return this.http.get<GoogleBooksMetadata>(url);
  }
}
