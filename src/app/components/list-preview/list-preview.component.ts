import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import { List } from '../../models/list';

@Component({
  selector: 'app-list-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-preview.component.html',
  styleUrls: ['./list-preview.component.scss'],
})
export class ListPreviewComponent implements OnInit {
  list: List | undefined;
  isLoading = true;
  listId!: number;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listService: ListService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (isNaN(id)) {
        this.router.navigate(['/']);
        return;
      }
      this.listId = id;
      this.loadList();
    });
  }

  loadList(): void {
    try {
      this.isLoading = true;
      const allPublicLists = this.listService.getAllPublicLists();
      this.list = allPublicLists.find((l) => l.id === this.listId);
      this.isLoading = false;

      if (!this.list) {
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      this.errorMessage = error.message;
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  login(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: `/lists/${this.listId}` },
    });
  }
}
