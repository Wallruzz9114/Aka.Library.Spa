import { SelectionModel } from '@angular/cdk/collections';
import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { forkJoin, zip } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import { slideInDownAnimation } from '../../animations';
import { AuthService } from '../../services/auth.service';
import { BooksService } from '../../services/books.service';
import { LibrariesService } from '../../services/libraries.service';
import { MemberService } from '../../services/member.service';
import { SignedOutBook } from '../../shared/signed-out-book';
import { SignedOutBookDetails } from '../../shared/signed-out-book-details';

@Component({
  selector: 'app-checked-out-books',
  templateUrl: './checked-out-books.component.html',
  styleUrls: ['./checked-out-books.component.scss'],
  animations: [slideInDownAnimation],
})
export class CheckedOutBooksComponent implements OnInit {
  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.position') position = 'initial';

  columns = ['id', 'library', 'title', 'dateCheckedOut', 'action'];
  dataSource = new MatTableDataSource();
  selection = new SelectionModel<Element>(true, []);

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private authService: AuthService,
    private memberService: MemberService,
    private router: Router,
    private libraryService: LibrariesService,
    private booksService: BooksService
  ) {}

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.memberService
      .getSignedOutBooks(this.authService.currentMember)
      .pipe(
        map((signedOutBooks: SignedOutBook[]) => {
          const obss = signedOutBooks.map((signedOutBook) =>
            forkJoin([
              this.libraryService.getLibrary(signedOutBook.libraryId),
              this.booksService.getBook(
                signedOutBook.libraryId,
                signedOutBook.bookId
              ),
            ]).pipe(
              map(([library, book]) => ({
                ...signedOutBook,
                libraryName: library.name,
                bookName: book.title,
              }))
            )
          );
          return zip(...obss);
        }),
        mergeAll()
      )
      .subscribe((signedOutBooks: SignedOutBookDetails[]) => {
        this.dataSource.data = signedOutBooks;
      });
  }

  selectRow(book: SignedOutBookDetails) {
    this.router.navigate([`/libraries/${book.libraryId}/books/${book.bookId}`]);
  }

  /**
   * Set the sort after the view init since this component will
   * be able to query its view for the initialized sort.
   */
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
